import { Router } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../utils/async-handler';
import { ApiError } from '../../utils/api-error';
import { sendSuccess } from '../../utils/api-response';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common.schema';
import { getParam } from '../../utils/http';

export const categoryRouter = Router();

categoryRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await prisma.produceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, { message: 'Categories retrieved', data: { categories } });
  }),
);

categoryRouter.get(
  '/:categoryId',
  validate({ params: uuidParam('categoryId') }),
  asyncHandler(async (req, res) => {
    const category = await prisma.produceCategory.findUnique({
      where: { id: getParam(req, 'categoryId') },
    });
    if (!category) throw ApiError.notFound('Category not found');
    sendSuccess(res, { message: 'Category retrieved', data: { category } });
  }),
);
