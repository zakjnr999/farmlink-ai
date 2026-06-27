import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common.schema';
import { listingController } from './listing.controller';
import {
  createListingSchema,
  extractSchema,
  marketplaceQuerySchema,
  myListingsQuerySchema,
  updateListingSchema,
} from './listing.schema';

// Farmer-owned listing operations under /listings.
export const listingRouter = Router();

listingRouter.use(authenticate, authorize(UserRole.FARMER));

listingRouter.post(
  '/extract',
  validate({ body: extractSchema }),
  asyncHandler(listingController.extract),
);
listingRouter.post(
  '/',
  validate({ body: createListingSchema }),
  asyncHandler(listingController.create),
);
listingRouter.get(
  '/my',
  validate({ query: myListingsQuerySchema }),
  asyncHandler(listingController.listMine),
);
listingRouter.get(
  '/:listingId',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(listingController.getOne),
);
listingRouter.patch(
  '/:listingId',
  validate({ params: uuidParam('listingId'), body: updateListingSchema }),
  asyncHandler(listingController.update),
);
listingRouter.post(
  '/:listingId/publish',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(listingController.publish),
);
listingRouter.post(
  '/:listingId/cancel',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(listingController.cancel),
);
listingRouter.get(
  '/:listingId/matches',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(listingController.matches),
);

// Public marketplace (read-only). Mounted separately at /marketplace.
export const marketplaceRouter = Router();

marketplaceRouter.get(
  '/listings',
  validate({ query: marketplaceQuerySchema }),
  asyncHandler(listingController.marketplaceSearch),
);
marketplaceRouter.get(
  '/listings/:listingId',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(listingController.marketplaceGetById),
);
