import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { buildPaginationMeta, sendSuccess } from '../../utils/api-response';
import { getValidatedQuery } from '../../middlewares/validate.middleware';
import { getParam } from '../../utils/http';
import { decimalToNumber } from '../../utils/decimal';
import { adminService } from './admin.service';
import type { AdminListingsQuery, AdminOffersQuery, AdminUsersQuery } from './admin.schema';

function ctx(req: Request) {
  return { ipAddress: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
}

function adminId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

function serializeOfferRow<T extends Record<string, unknown>>(row: T) {
  return {
    ...row,
    offeredQuantity: decimalToNumber(row.offeredQuantity as never),
    offeredPricePerUnit: decimalToNumber(row.offeredPricePerUnit as never),
    totalAmount: decimalToNumber(row.totalAmount as never),
  };
}

export const adminController = {
  async dashboard(_req: Request, res: Response): Promise<void> {
    const data = await adminService.dashboard();
    sendSuccess(res, { message: 'Dashboard metrics retrieved', data });
  },

  async listUsers(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<AdminUsersQuery>(req);
    const { items, total, page, limit } = await adminService.listUsers(query);
    sendSuccess(res, {
      message: 'Users retrieved',
      data: { users: items },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async getUser(req: Request, res: Response): Promise<void> {
    const user = await adminService.getUser(getParam(req, 'userId'));
    sendSuccess(res, { message: 'User retrieved', data: { user } });
  },

  async updateUserStatus(req: Request, res: Response): Promise<void> {
    const user = await adminService.updateUserStatus(
      adminId(req),
      getParam(req, 'userId'),
      req.body,
      ctx(req),
    );
    sendSuccess(res, { message: 'User status updated', data: { user } });
  },

  async listListings(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<AdminListingsQuery>(req);
    const { items, total, page, limit } = await adminService.listListings(query);
    sendSuccess(res, {
      message: 'Listings retrieved',
      data: { listings: items },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async getListing(req: Request, res: Response): Promise<void> {
    const listing = await adminService.getListing(getParam(req, 'listingId'));
    sendSuccess(res, { message: 'Listing retrieved', data: { listing } });
  },

  async updateListingStatus(req: Request, res: Response): Promise<void> {
    const listing = await adminService.updateListingStatus(
      adminId(req),
      getParam(req, 'listingId'),
      req.body,
      ctx(req),
    );
    sendSuccess(res, { message: 'Listing status updated', data: { listing } });
  },

  async listOffers(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<AdminOffersQuery>(req);
    const { items, total, page, limit } = await adminService.listOffers(query);
    sendSuccess(res, {
      message: 'Offers retrieved',
      data: { offers: items.map(serializeOfferRow) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async listTransactions(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<AdminOffersQuery>(req);
    const { items, total, page, limit } = await adminService.listTransactions(query);
    sendSuccess(res, {
      message: 'Transactions retrieved',
      data: { transactions: items.map(serializeOfferRow) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async listMatches(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<AdminOffersQuery>(req);
    const { items, total, page, limit } = await adminService.listMatches(query);
    sendSuccess(res, {
      message: 'Matches retrieved',
      data: { matches: items },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async regenerateMatches(req: Request, res: Response): Promise<void> {
    const matches = await adminService.regenerateMatches(
      adminId(req),
      getParam(req, 'listingId'),
      ctx(req),
    );
    sendSuccess(res, { message: 'Matches regenerated', data: { count: matches.length, matches } });
  },

  async listAuditLogs(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<AdminOffersQuery>(req);
    const { items, total, page, limit } = await adminService.listAuditLogs(query);
    sendSuccess(res, {
      message: 'Audit logs retrieved',
      data: { auditLogs: items },
      meta: buildPaginationMeta(page, limit, total),
    });
  },
};
