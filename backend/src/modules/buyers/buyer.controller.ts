import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { buildPaginationMeta, sendSuccess } from '../../utils/api-response';
import { getValidatedQuery } from '../../middlewares/validate.middleware';
import { getParam } from '../../utils/http';
import { decimalToNumber } from '../../utils/decimal';
import { buyerService } from './buyer.service';
import { offerService } from '../offers/offer.service';
import { transactionService } from '../transactions/transaction.service';
import { serializeOffer, serializeTransaction } from '../offers/offer.serializer';
import type { RecommendationsQuery } from './buyer.schema';
import type { ListOffersQuery } from '../offers/offer.schema';

function ctx(req: Request) {
  return { ipAddress: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
}

function userId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

function serializeDemand<
  T extends { minimumQuantity: unknown; maximumQuantity: unknown; preferredPriceMaximum: unknown },
>(demand: T) {
  return {
    ...demand,
    minimumQuantity: decimalToNumber(demand.minimumQuantity as never),
    maximumQuantity: decimalToNumber(demand.maximumQuantity as never),
    preferredPriceMaximum: decimalToNumber(demand.preferredPriceMaximum as never),
  };
}

export const buyerController = {
  async createProfile(req: Request, res: Response): Promise<void> {
    const profile = await buyerService.createProfile(userId(req), req.body);
    sendSuccess(res, { statusCode: 201, message: 'Buyer profile created', data: { profile } });
  },

  async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await buyerService.getProfileByUserId(userId(req));
    sendSuccess(res, { message: 'Buyer profile retrieved', data: { profile } });
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    const profile = await buyerService.updateProfile(userId(req), req.body);
    sendSuccess(res, { message: 'Buyer profile updated', data: { profile } });
  },

  async createDemand(req: Request, res: Response): Promise<void> {
    const demand = await buyerService.createDemand(userId(req), req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: 'Demand created',
      data: { demand: serializeDemand(demand) },
    });
  },

  async listDemands(req: Request, res: Response): Promise<void> {
    const demands = await buyerService.listDemands(userId(req));
    sendSuccess(res, {
      message: 'Demands retrieved',
      data: { demands: demands.map(serializeDemand) },
    });
  },

  async updateDemand(req: Request, res: Response): Promise<void> {
    const demand = await buyerService.updateDemand(
      userId(req),
      getParam(req, 'demandId'),
      req.body,
    );
    sendSuccess(res, { message: 'Demand updated', data: { demand: serializeDemand(demand) } });
  },

  async deleteDemand(req: Request, res: Response): Promise<void> {
    await buyerService.deleteDemand(userId(req), getParam(req, 'demandId'));
    sendSuccess(res, { message: 'Demand deleted', data: { deleted: true } });
  },

  async listRecommendations(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<RecommendationsQuery>(req);
    const { items, total, page, limit } = await buyerService.listRecommendations(
      userId(req),
      query,
    );
    sendSuccess(res, {
      message: 'Recommendations retrieved',
      data: { recommendations: items },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async listOffers(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<ListOffersQuery>(req);
    const { items, total, page, limit } = await offerService.listForBuyer(userId(req), query);
    sendSuccess(res, {
      message: 'Offers retrieved',
      data: { offers: items.map(serializeOffer) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async getOffer(req: Request, res: Response): Promise<void> {
    const offer = await offerService.getForBuyer(userId(req), getParam(req, 'offerId'));
    sendSuccess(res, { message: 'Offer retrieved', data: { offer: serializeOffer(offer) } });
  },

  async cancelOffer(req: Request, res: Response): Promise<void> {
    const offer = await offerService.cancelByBuyer(userId(req), getParam(req, 'offerId'), ctx(req));
    sendSuccess(res, { message: 'Offer cancelled', data: { offer: serializeOffer(offer) } });
  },

  async listTransactions(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<ListOffersQuery>(req);
    const { items, total, page, limit } = await transactionService.listForBuyer(userId(req), query);
    sendSuccess(res, {
      message: 'Transactions retrieved',
      data: { transactions: items.map(serializeTransaction) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },
};
