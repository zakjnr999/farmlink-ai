import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../utils/api-error';
import { buildPaginationMeta, sendSuccess } from '../../utils/api-response';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate, getValidatedQuery } from '../../middlewares/validate.middleware';
import { paginationQuerySchema, uuidParam } from '../../utils/common.schema';
import { resolvePagination } from '../../utils/pagination';
import { getParam } from '../../utils/http';
import { notificationService } from '../../services/notification.service';

const listQuerySchema = paginationQuerySchema.extend({
  unreadOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform((v) => v === true || v === 'true')
    .optional(),
});

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get(
  '/',
  validate({ query: listQuerySchema }),
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const query = getValidatedQuery<z.infer<typeof listQuerySchema>>(req);
    const { skip, take, page, limit } = resolvePagination(query);
    const { items, total } = await notificationService.list(req.user.id, {
      skip,
      take,
      unreadOnly: query.unreadOnly,
    });
    sendSuccess(res, {
      message: 'Notifications retrieved',
      data: { notifications: items },
      meta: buildPaginationMeta(page, limit, total),
    });
  }),
);

notificationRouter.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const count = await notificationService.unreadCount(req.user.id);
    sendSuccess(res, { message: 'Unread count retrieved', data: { unreadCount: count } });
  }),
);

notificationRouter.patch(
  '/:notificationId/read',
  validate({ params: uuidParam('notificationId') }),
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const updated = await notificationService.markRead(
      req.user.id,
      getParam(req, 'notificationId'),
    );
    if (!updated) throw ApiError.notFound('Notification not found or already read');
    sendSuccess(res, { message: 'Notification marked as read', data: { updated: true } });
  }),
);

notificationRouter.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    if (!req.user) throw ApiError.unauthorized();
    const count = await notificationService.markAllRead(req.user.id);
    sendSuccess(res, {
      message: 'All notifications marked as read',
      data: { updatedCount: count },
    });
  }),
);
