import {
  ListingStatus,
  NotificationType,
  OfferStatus,
  Prisma,
  RecommendationStatus,
  TransactionStatus,
} from '@prisma/client';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/api-error';
import { computeTotalAmount } from '../../utils/decimal';
import { resolvePagination } from '../../utils/pagination';
import { notificationService } from '../../services/notification.service';
import { auditService } from '../../services/audit.service';
import type { CreateOfferInput, ListOffersQuery } from './offer.schema';

interface ActorContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

const PUBLISHED_STATES: ListingStatus[] = [
  ListingStatus.PUBLISHED,
  ListingStatus.PARTIALLY_RESERVED,
];

export const offerService = {
  async createOffer(buyerUserId: string, input: CreateOfferInput, ctx: ActorContext = {}) {
    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: buyerUserId },
      select: { id: true },
    });
    if (!buyer) throw ApiError.forbidden('You must create a buyer profile first');

    const listing = await prisma.produceListing.findUnique({
      where: { id: input.listingId },
      include: { farmer: { select: { userId: true } } },
    });
    if (!listing) throw ApiError.notFound('Listing not found');

    if (!PUBLISHED_STATES.includes(listing.status)) {
      throw ApiError.badRequest('Offers can only be made on published listings');
    }
    if (listing.farmer.userId === buyerUserId) {
      throw ApiError.forbidden('You cannot make an offer on your own listing');
    }

    const available = Number(listing.quantity) - Number(listing.reservedQuantity);
    if (input.offeredQuantity > available) {
      throw ApiError.badRequest(
        `Offered quantity (${input.offeredQuantity}) exceeds available quantity (${available})`,
      );
    }

    const totalAmount = computeTotalAmount(input.offeredQuantity, input.offeredPricePerUnit);

    const offer = await prisma.offer.create({
      data: {
        listingId: listing.id,
        buyerId: buyer.id,
        offeredQuantity: new Prisma.Decimal(input.offeredQuantity),
        unit: input.unit,
        offeredPricePerUnit: new Prisma.Decimal(input.offeredPricePerUnit),
        totalAmount: new Prisma.Decimal(totalAmount),
        message: input.message ?? null,
        proposedPickupDate: input.proposedPickupDate,
        expiresAt: input.expiresAt ?? null,
      },
    });

    // Best-effort: mark recommendation as offered.
    await prisma.matchRecommendation.updateMany({
      where: {
        listingId: listing.id,
        buyerId: buyer.id,
        status: { in: [RecommendationStatus.RECOMMENDED, RecommendationStatus.VIEWED] },
      },
      data: { status: RecommendationStatus.OFFERED },
    });

    await notificationService.create({
      userId: listing.farmer.userId,
      type: NotificationType.OFFER_RECEIVED,
      title: 'New offer received',
      message: `You received an offer for ${input.offeredQuantity} ${input.unit.toLowerCase()} on "${listing.title}".`,
      metadata: { offerId: offer.id, listingId: listing.id },
    });

    await auditService.record({
      actorUserId: buyerUserId,
      action: 'OFFER_CREATED',
      entityType: 'Offer',
      entityId: offer.id,
      metadata: { listingId: listing.id, totalAmount },
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });

    logger.info({ offerId: offer.id, listingId: listing.id }, 'Offer created');
    return offer;
  },

  async listForBuyer(buyerUserId: string, query: ListOffersQuery) {
    const buyer = await prisma.buyerProfile.findUnique({
      where: { userId: buyerUserId },
      select: { id: true },
    });
    if (!buyer) throw ApiError.forbidden('You must create a buyer profile first');

    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.OfferWhereInput = {
      buyerId: buyer.id,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.offer.findMany({ where, orderBy: { createdAt: query.sortOrder }, skip, take }),
      prisma.offer.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async listForFarmer(farmerUserId: string, query: ListOffersQuery) {
    const { skip, take, page, limit } = resolvePagination(query);
    const where: Prisma.OfferWhereInput = {
      listing: { farmer: { userId: farmerUserId } },
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { createdAt: query.sortOrder },
        skip,
        take,
        include: { listing: { select: { title: true } } },
      }),
      prisma.offer.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  async getForBuyer(buyerUserId: string, offerId: string) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, buyer: { userId: buyerUserId } },
    });
    if (!offer) throw ApiError.notFound('Offer not found');
    return offer;
  },

  async getForFarmer(farmerUserId: string, offerId: string) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, listing: { farmer: { userId: farmerUserId } } },
    });
    if (!offer) throw ApiError.notFound('Offer not found');
    return offer;
  },

  async cancelByBuyer(buyerUserId: string, offerId: string, ctx: ActorContext = {}) {
    const offer = await this.getForBuyer(buyerUserId, offerId);
    if (offer.status !== OfferStatus.PENDING) {
      throw ApiError.badRequest('Only pending offers can be cancelled');
    }
    const result = await prisma.offer.updateMany({
      where: { id: offerId, status: OfferStatus.PENDING },
      data: { status: OfferStatus.CANCELLED, cancelledAt: new Date() },
    });
    if (result.count === 0) {
      throw ApiError.conflict('Offer is no longer pending');
    }
    await auditService.record({
      actorUserId: buyerUserId,
      action: 'OFFER_CANCELLED',
      entityType: 'Offer',
      entityId: offerId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return prisma.offer.findUniqueOrThrow({ where: { id: offerId } });
  },

  async rejectByFarmer(farmerUserId: string, offerId: string, ctx: ActorContext = {}) {
    const offer = await this.getForFarmer(farmerUserId, offerId);
    if (offer.status !== OfferStatus.PENDING) {
      throw ApiError.badRequest('Only pending offers can be rejected');
    }
    const result = await prisma.offer.updateMany({
      where: { id: offerId, status: OfferStatus.PENDING },
      data: { status: OfferStatus.REJECTED, rejectedAt: new Date() },
    });
    if (result.count === 0) {
      throw ApiError.conflict('Offer is no longer pending');
    }

    const buyerUser = await prisma.buyerProfile.findUnique({
      where: { id: offer.buyerId },
      select: { userId: true },
    });
    if (buyerUser) {
      await notificationService.create({
        userId: buyerUser.userId,
        type: NotificationType.OFFER_REJECTED,
        title: 'Offer rejected',
        message: 'Your offer was not accepted by the farmer.',
        metadata: { offerId },
      });
    }

    await auditService.record({
      actorUserId: farmerUserId,
      action: 'OFFER_REJECTED',
      entityType: 'Offer',
      entityId: offerId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return prisma.offer.findUniqueOrThrow({ where: { id: offerId } });
  },

  /**
   * Accept an offer. Runs inside a DB transaction and guards against double
   * acceptance and overselling using conditional updates.
   */
  async acceptByFarmer(farmerUserId: string, offerId: string, ctx: ActorContext = {}) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.offer.findFirst({
        where: { id: offerId, listing: { farmer: { userId: farmerUserId } } },
        include: { listing: true },
      });
      if (!offer) throw ApiError.notFound('Offer not found');
      if (offer.status !== OfferStatus.PENDING) {
        throw ApiError.conflict('Only pending offers can be accepted');
      }
      if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
        await tx.offer.updateMany({
          where: { id: offerId, status: OfferStatus.PENDING },
          data: { status: OfferStatus.EXPIRED },
        });
        throw ApiError.badRequest('This offer has expired and cannot be accepted');
      }

      const listing = offer.listing;
      const totalQty = Number(listing.quantity);
      const reserved = Number(listing.reservedQuantity);
      const offered = Number(offer.offeredQuantity);
      const available = totalQty - reserved;

      if (offered > available) {
        throw ApiError.badRequest(
          `Insufficient available quantity. Available: ${available}, offered: ${offered}`,
        );
      }

      // Claim the offer atomically (prevents double acceptance).
      const claimed = await tx.offer.updateMany({
        where: { id: offerId, status: OfferStatus.PENDING },
        data: { status: OfferStatus.ACCEPTED, acceptedAt: new Date() },
      });
      if (claimed.count === 0) {
        throw ApiError.conflict('Offer was already processed');
      }

      const newReserved = reserved + offered;
      const newAvailable = totalQty - newReserved;
      const newStatus =
        newReserved >= totalQty ? ListingStatus.RESERVED : ListingStatus.PARTIALLY_RESERVED;

      // Conditional update guarantees reserved can never exceed quantity.
      const listingUpdate = await tx.produceListing.updateMany({
        where: { id: listing.id, reservedQuantity: listing.reservedQuantity },
        data: {
          reservedQuantity: new Prisma.Decimal(newReserved),
          status: newStatus,
        },
      });
      if (listingUpdate.count === 0) {
        // Optimistic concurrency failure — abort the whole transaction.
        throw ApiError.conflict('Listing changed concurrently, please retry');
      }

      const transaction = await tx.produceTransaction.create({
        data: {
          offerId: offer.id,
          listingId: listing.id,
          farmerId: listing.farmerId,
          buyerId: offer.buyerId,
          agreedQuantity: offer.offeredQuantity,
          unit: offer.unit,
          agreedPricePerUnit: offer.offeredPricePerUnit,
          totalAmount: offer.totalAmount,
          pickupDate: offer.proposedPickupDate,
          status: TransactionStatus.CONFIRMED,
        },
      });

      // Mark the converted recommendation.
      await tx.matchRecommendation.updateMany({
        where: { listingId: listing.id, buyerId: offer.buyerId },
        data: { status: RecommendationStatus.CONVERTED },
      });

      // Auto-reject other pending offers that can no longer be fulfilled.
      const otherPending = await tx.offer.findMany({
        where: { listingId: listing.id, status: OfferStatus.PENDING, id: { not: offer.id } },
        select: { id: true, offeredQuantity: true, buyerId: true },
      });
      const rejectedBuyerIds: string[] = [];
      for (const other of otherPending) {
        if (Number(other.offeredQuantity) > newAvailable) {
          await tx.offer.update({
            where: { id: other.id },
            data: { status: OfferStatus.REJECTED, rejectedAt: new Date() },
          });
          rejectedBuyerIds.push(other.buyerId);
        }
      }

      // Notify the accepted buyer.
      const acceptedBuyer = await tx.buyerProfile.findUnique({
        where: { id: offer.buyerId },
        select: { userId: true },
      });
      if (acceptedBuyer) {
        await notificationService.create(
          {
            userId: acceptedBuyer.userId,
            type: NotificationType.OFFER_ACCEPTED,
            title: 'Offer accepted',
            message: `Your offer on "${listing.title}" was accepted. A transaction has been created.`,
            metadata: { offerId: offer.id, transactionId: transaction.id },
          },
          tx,
        );
      }

      // Notify auto-rejected buyers.
      if (rejectedBuyerIds.length > 0) {
        const rejectedBuyers = await tx.buyerProfile.findMany({
          where: { id: { in: rejectedBuyerIds } },
          select: { userId: true },
        });
        for (const b of rejectedBuyers) {
          await notificationService.create(
            {
              userId: b.userId,
              type: NotificationType.OFFER_REJECTED,
              title: 'Offer no longer available',
              message: `The listing "${listing.title}" no longer has enough quantity for your offer.`,
              metadata: { listingId: listing.id },
            },
            tx,
          );
        }
      }

      await auditService.record(
        {
          actorUserId: farmerUserId,
          action: 'OFFER_ACCEPTED',
          entityType: 'Offer',
          entityId: offer.id,
          metadata: { transactionId: transaction.id, listingId: listing.id },
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
        },
        tx,
      );

      logger.info(
        { offerId: offer.id, transactionId: transaction.id, listingId: listing.id },
        'Offer accepted and transaction created',
      );

      const updatedOffer = await tx.offer.findUniqueOrThrow({ where: { id: offer.id } });
      return { offer: updatedOffer, transaction };
    });
  },
};
