import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { paginationQuerySchema, uuidParam } from '../../utils/common.schema';
import { buyerController } from './buyer.controller';
import {
  createBuyerProfileSchema,
  createDemandSchema,
  recommendationsQuerySchema,
  updateBuyerProfileSchema,
  updateDemandSchema,
} from './buyer.schema';
import { listOffersQuerySchema } from '../offers/offer.schema';

export const buyerRouter = Router();

buyerRouter.use(authenticate, authorize(UserRole.BUYER));

buyerRouter.post(
  '/profile',
  validate({ body: createBuyerProfileSchema }),
  asyncHandler(buyerController.createProfile),
);
buyerRouter.get('/profile', asyncHandler(buyerController.getProfile));
buyerRouter.patch(
  '/profile',
  validate({ body: updateBuyerProfileSchema }),
  asyncHandler(buyerController.updateProfile),
);

buyerRouter.post(
  '/demands',
  validate({ body: createDemandSchema }),
  asyncHandler(buyerController.createDemand),
);
buyerRouter.get('/demands', asyncHandler(buyerController.listDemands));
buyerRouter.patch(
  '/demands/:demandId',
  validate({ params: uuidParam('demandId'), body: updateDemandSchema }),
  asyncHandler(buyerController.updateDemand),
);
buyerRouter.delete(
  '/demands/:demandId',
  validate({ params: uuidParam('demandId') }),
  asyncHandler(buyerController.deleteDemand),
);

buyerRouter.get(
  '/recommendations',
  validate({ query: recommendationsQuerySchema }),
  asyncHandler(buyerController.listRecommendations),
);

buyerRouter.get(
  '/offers',
  validate({ query: listOffersQuerySchema }),
  asyncHandler(buyerController.listOffers),
);
buyerRouter.get(
  '/offers/:offerId',
  validate({ params: uuidParam('offerId') }),
  asyncHandler(buyerController.getOffer),
);
buyerRouter.post(
  '/offers/:offerId/cancel',
  validate({ params: uuidParam('offerId') }),
  asyncHandler(buyerController.cancelOffer),
);

buyerRouter.get(
  '/transactions',
  validate({ query: paginationQuerySchema }),
  asyncHandler(buyerController.listTransactions),
);
