import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { offerController } from './offer.controller';
import { createOfferSchema } from './offer.schema';

export const offerRouter = Router();

// Only buyers may create offers.
offerRouter.post(
  '/',
  authenticate,
  authorize(UserRole.BUYER),
  validate({ body: createOfferSchema }),
  asyncHandler(offerController.create),
);
