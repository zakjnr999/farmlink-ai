import type { Request, Response } from 'express';
import { ApiError } from '../../utils/api-error';
import { sendSuccess } from '../../utils/api-response';
import { offerService } from './offer.service';
import { serializeOffer } from './offer.serializer';

export const offerController = {
  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw ApiError.unauthorized();
    const offer = await offerService.createOffer(req.user.id, req.body, {
      ipAddress: req.ip ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    });
    sendSuccess(res, {
      statusCode: 201,
      message: 'Offer submitted successfully',
      data: { offer: serializeOffer(offer) },
    });
  },
};
