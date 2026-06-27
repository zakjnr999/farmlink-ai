import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common.schema';
import { farmerController } from './farmer.controller';
import { createFarmerProfileSchema, updateFarmerProfileSchema } from './farmer.schema';
import { listOffersQuerySchema } from '../offers/offer.schema';
import { paginationQuerySchema } from '../../utils/common.schema';

export const farmerRouter = Router();

farmerRouter.use(authenticate, authorize(UserRole.FARMER));

farmerRouter.post(
  '/profile',
  validate({ body: createFarmerProfileSchema }),
  asyncHandler(farmerController.createProfile),
);
farmerRouter.get('/profile', asyncHandler(farmerController.getProfile));
farmerRouter.patch(
  '/profile',
  validate({ body: updateFarmerProfileSchema }),
  asyncHandler(farmerController.updateProfile),
);

farmerRouter.get(
  '/offers',
  validate({ query: listOffersQuerySchema }),
  asyncHandler(farmerController.listOffers),
);
farmerRouter.get(
  '/offers/:offerId',
  validate({ params: uuidParam('offerId') }),
  asyncHandler(farmerController.getOffer),
);
farmerRouter.post(
  '/offers/:offerId/accept',
  validate({ params: uuidParam('offerId') }),
  asyncHandler(farmerController.acceptOffer),
);
farmerRouter.post(
  '/offers/:offerId/reject',
  validate({ params: uuidParam('offerId') }),
  asyncHandler(farmerController.rejectOffer),
);

farmerRouter.get(
  '/transactions',
  validate({ query: paginationQuerySchema }),
  asyncHandler(farmerController.listTransactions),
);

farmerRouter.get('/transport-suggestions', asyncHandler(farmerController.listTransportSuggestions));
