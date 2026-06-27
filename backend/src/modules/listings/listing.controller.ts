import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { buildPaginationMeta, sendSuccess } from '../../utils/api-response';
import { getValidatedQuery } from '../../middlewares/validate.middleware';
import { getParam } from '../../utils/http';
import { listingService } from './listing.service';
import { serializeListing } from './listing.serializer';
import type { MarketplaceQuery, MyListingsQuery } from './listing.schema';

function ctx(req: Request) {
  return { ipAddress: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
}

function userId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const listingController = {
  async extract(req: Request, res: Response): Promise<void> {
    const result = await listingService.extract(req.body);
    sendSuccess(res, { message: 'Produce details extracted', data: result });
  },

  async create(req: Request, res: Response): Promise<void> {
    const listing = await listingService.createListing(userId(req), req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: 'Produce listing created successfully',
      data: { listing: serializeListing(listing) },
    });
  },

  async listMine(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<MyListingsQuery>(req);
    const { items, total, page, limit } = await listingService.listMine(userId(req), query);
    sendSuccess(res, {
      message: 'Listings retrieved',
      data: { listings: items.map(serializeListing) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async getOne(req: Request, res: Response): Promise<void> {
    const listing = await listingService.getOwnedListing(userId(req), getParam(req, 'listingId'));
    sendSuccess(res, {
      message: 'Listing retrieved',
      data: { listing: serializeListing(listing) },
    });
  },

  async update(req: Request, res: Response): Promise<void> {
    const listing = await listingService.updateListing(
      userId(req),
      getParam(req, 'listingId'),
      req.body,
    );
    sendSuccess(res, { message: 'Listing updated', data: { listing: serializeListing(listing) } });
  },

  async publish(req: Request, res: Response): Promise<void> {
    const listing = await listingService.publishListing(
      userId(req),
      getParam(req, 'listingId'),
      ctx(req),
    );
    sendSuccess(res, {
      message: 'Listing published; buyer matches are being generated',
      data: { listing: serializeListing(listing) },
    });
  },

  async cancel(req: Request, res: Response): Promise<void> {
    const listing = await listingService.cancelListing(
      userId(req),
      getParam(req, 'listingId'),
      ctx(req),
    );
    sendSuccess(res, {
      message: 'Listing cancelled',
      data: { listing: serializeListing(listing) },
    });
  },

  async matches(req: Request, res: Response): Promise<void> {
    const matches = await listingService.getMatchesForOwnedListing(
      userId(req),
      getParam(req, 'listingId'),
    );
    sendSuccess(res, { message: 'Matches retrieved', data: { matches } });
  },

  async marketplaceSearch(req: Request, res: Response): Promise<void> {
    const query = getValidatedQuery<MarketplaceQuery>(req);
    const { items, total, page, limit } = await listingService.marketplaceSearch(query);
    sendSuccess(res, {
      message: 'Marketplace listings retrieved',
      data: { listings: items.map(serializeListing) },
      meta: buildPaginationMeta(page, limit, total),
    });
  },

  async marketplaceGetById(req: Request, res: Response): Promise<void> {
    const listing = await listingService.marketplaceGetById(getParam(req, 'listingId'));
    sendSuccess(res, {
      message: 'Listing retrieved',
      data: { listing: serializeListing(listing) },
    });
  },
};
