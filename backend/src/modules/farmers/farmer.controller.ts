import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { sendSuccess, buildPaginationMeta } from '../../utils/api-response';
import { getValidatedQuery } from '../../middlewares/validate.middleware';
import { getParam } from '../../utils/http';
import { farmerService } from './farmer.service';
import { offerService } from '../offers/offer.service';
import { transactionService } from '../transactions/transaction.service';
import { transportService } from '../../services/transport.service';
import { serializeOffer, serializeTransaction } from '../offers/offer.serializer';
import type { ListOffersQuery } from '../offers/offer.schema';

function ctx(req: Request) {
  return { ipAddress: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
}

function userId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const farmerController = {
  async createProfile(req: Request, res: Response): Promise<void> {
    const profile = await farmerService.createProfile(userId(req), req.body);
    sendSuccess(res, { statusCode: 201, message: 'Farmer profile created', data: { profile } });
  },

  async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await farmerService.getProfileByUserId(userId(req));
    sendSuccess(res, { message: 'Farmer profile retrieved', data: { profile } });
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    const profile = await farmerService.updateProfile(userId(req), req.body);
    sendSuccess(res, { message: 'Farmer profile updated', data: { profile } });
  },

  async listOffers(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<ListOffersQuery>(req);
    const { items, total, page, limit } = await offerService.listForFarmer(userId(req), query);
    sendSuccess(res, {
      message: 'Offers retrieved',
      data: { offers: items.map(serializeOffer) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async getOffer(req: Request, res: Response): Promise<void> {
    const offer = await offerService.getForFarmer(userId(req), getParam(req, 'offerId'));
    sendSuccess(res, { message: 'Offer retrieved', data: { offer: serializeOffer(offer) } });
  },

  async acceptOffer(req: Request, res: Response): Promise<void> {
    const result = await offerService.acceptByFarmer(
      userId(req),
      getParam(req, 'offerId'),
      ctx(req),
    );
    sendSuccess(res, {
      message: 'Offer accepted and transaction created',
      data: {
        offer: serializeOffer(result.offer),
        transaction: serializeTransaction(result.transaction),
      },
    });
  },

  async rejectOffer(req: Request, res: Response): Promise<void> {
    const offer = await offerService.rejectByFarmer(
      userId(req),
      getParam(req, 'offerId'),
      ctx(req),
    );
    sendSuccess(res, { message: 'Offer rejected', data: { offer: serializeOffer(offer) } });
  },

  async listTransactions(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<ListOffersQuery>(req);
    const { items, total, page, limit } = await transactionService.listForFarmer(
      userId(req),
      query,
    );
    sendSuccess(res, {
      message: 'Transactions retrieved',
      data: { transactions: items.map(serializeTransaction) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async listTransportSuggestions(req: Request, res: Response): Promise<void> {
    const suggestions = await transportService.listForFarmer(userId(req));
    sendSuccess(res, { message: 'Transport suggestions retrieved', data: { suggestions } });
  },
};
