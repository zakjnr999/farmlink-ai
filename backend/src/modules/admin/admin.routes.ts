import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { paginationQuerySchema, uuidParam } from '../../utils/common.schema';
import { adminController } from './admin.controller';
import {
  adminListingsQuerySchema,
  adminOffersQuerySchema,
  adminUsersQuerySchema,
  updateListingStatusSchema,
  updateUserStatusSchema,
} from './admin.schema';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize(UserRole.ADMIN));

adminRouter.get('/dashboard', asyncHandler(adminController.dashboard));

adminRouter.get(
  '/users',
  validate({ query: adminUsersQuerySchema }),
  asyncHandler(adminController.listUsers),
);
adminRouter.get(
  '/users/:userId',
  validate({ params: uuidParam('userId') }),
  asyncHandler(adminController.getUser),
);
adminRouter.patch(
  '/users/:userId/status',
  validate({ params: uuidParam('userId'), body: updateUserStatusSchema }),
  asyncHandler(adminController.updateUserStatus),
);

adminRouter.get(
  '/listings',
  validate({ query: adminListingsQuerySchema }),
  asyncHandler(adminController.listListings),
);
adminRouter.get(
  '/listings/:listingId',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(adminController.getListing),
);
adminRouter.patch(
  '/listings/:listingId/status',
  validate({ params: uuidParam('listingId'), body: updateListingStatusSchema }),
  asyncHandler(adminController.updateListingStatus),
);
adminRouter.post(
  '/listings/:listingId/regenerate-matches',
  validate({ params: uuidParam('listingId') }),
  asyncHandler(adminController.regenerateMatches),
);

adminRouter.get(
  '/offers',
  validate({ query: adminOffersQuerySchema }),
  asyncHandler(adminController.listOffers),
);
adminRouter.get(
  '/transactions',
  validate({ query: paginationQuerySchema }),
  asyncHandler(adminController.listTransactions),
);
adminRouter.get(
  '/matches',
  validate({ query: adminOffersQuerySchema }),
  asyncHandler(adminController.listMatches),
);
adminRouter.get(
  '/audit-logs',
  validate({ query: paginationQuerySchema }),
  asyncHandler(adminController.listAuditLogs),
);
