import { env } from './env';

const bearerAuth = [{ bearerAuth: [] }];

function paginated(itemsKey: string) {
  return {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: {
        type: 'object',
        properties: { [itemsKey]: { type: 'array', items: { type: 'object' } } },
      },
      meta: { $ref: '#/components/schemas/PaginationMeta' },
    },
  };
}

/**
 * Hand-authored OpenAPI 3 document. It is intentionally pragmatic — it documents
 * every route group, the security scheme, and representative request bodies for
 * the core demo flow so the Swagger UI is useful during the hackathon.
 */
export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'FarmLink AI API',
    version: '0.1.0',
    description:
      'Ghana-focused agricultural marketplace and produce-matching backend. ' +
      'Connects farmers with buyers using AI extraction and a transparent matching engine.',
  },
  servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: 'Local' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Categories' },
    { name: 'Farmer Profiles' },
    { name: 'Buyer Profiles' },
    { name: 'Listings' },
    { name: 'Marketplace' },
    { name: 'AI Extraction' },
    { name: 'Matching' },
    { name: 'Offers' },
    { name: 'Transactions' },
    { name: 'Notifications' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean' },
          hasPreviousPage: { type: 'boolean' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: {
            type: 'object',
            properties: { code: { type: 'string' }, details: {} },
          },
          requestId: { type: 'string' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'phoneNumber', 'password', 'role'],
        properties: {
          fullName: { type: 'string', example: 'Kwame Mensah' },
          phoneNumber: { type: 'string', example: '+233240000000' },
          email: { type: 'string', example: 'kwame@example.com' },
          password: { type: 'string', example: 'StrongPassword123!' },
          role: { type: 'string', enum: ['FARMER', 'BUYER'], example: 'FARMER' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: {
            type: 'string',
            example: 'farmer@farmlink.local',
            description: 'Email or phone number',
          },
          password: { type: 'string', example: 'FarmerPassword123!' },
        },
      },
      ExtractRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            example: 'I have 60 crates of tomatoes ready next Monday at Agogo',
          },
          referenceDate: { type: 'string', example: '2026-06-26' },
        },
      },
      CreateListingRequest: {
        type: 'object',
        required: [
          'categoryId',
          'title',
          'description',
          'quantity',
          'unit',
          'harvestDate',
          'availableFrom',
          'region',
          'district',
          'town',
          'latitude',
          'longitude',
        ],
        properties: {
          categoryId: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Fresh tomatoes available in Agogo' },
          description: { type: 'string' },
          quantity: { type: 'number', example: 60 },
          unit: { type: 'string', example: 'CRATE' },
          minimumOrderQuantity: { type: 'number', example: 10 },
          pricePerUnit: { type: 'number', example: 180 },
          harvestDate: { type: 'string', example: '2026-06-29' },
          availableFrom: { type: 'string', example: '2026-06-29' },
          region: { type: 'string', example: 'Ashanti' },
          district: { type: 'string', example: 'Asante Akim North' },
          town: { type: 'string', example: 'Agogo' },
          latitude: { type: 'number', example: 6.8001 },
          longitude: { type: 'number', example: -1.0819 },
          sourceType: { type: 'string', example: 'VOICE_TRANSCRIPTION' },
        },
      },
      CreateOfferRequest: {
        type: 'object',
        required: [
          'listingId',
          'offeredQuantity',
          'unit',
          'offeredPricePerUnit',
          'proposedPickupDate',
        ],
        properties: {
          listingId: { type: 'string', format: 'uuid' },
          offeredQuantity: { type: 'number', example: 40 },
          unit: { type: 'string', example: 'CRATE' },
          offeredPricePerUnit: { type: 'number', example: 175 },
          message: { type: 'string' },
          proposedPickupDate: { type: 'string', example: '2026-06-30' },
        },
      },
    },
  },
  security: bearerAuth,
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        security: [],
        summary: 'API health',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Register a farmer or buyer',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
          },
        },
        responses: { 201: { description: 'Created' }, 409: { description: 'Conflict' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } },
          },
        },
        responses: { 200: { description: 'OK' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        security: bearerAuth,
        summary: 'Current user',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        security: [],
        summary: 'List produce categories',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/categories/{categoryId}': {
      get: {
        tags: ['Categories'],
        security: [],
        summary: 'Get a category',
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/farmers/profile': {
      post: {
        tags: ['Farmer Profiles'],
        security: bearerAuth,
        summary: 'Create farmer profile',
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: ['Farmer Profiles'],
        security: bearerAuth,
        summary: 'Get farmer profile',
        responses: { 200: { description: 'OK' } },
      },
      patch: {
        tags: ['Farmer Profiles'],
        security: bearerAuth,
        summary: 'Update farmer profile',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/listings/extract': {
      post: {
        tags: ['AI Extraction'],
        security: bearerAuth,
        summary: 'Extract structured produce data from natural language',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ExtractRequest' } },
          },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/listings': {
      post: {
        tags: ['Listings'],
        security: bearerAuth,
        summary: 'Create a produce listing (draft)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateListingRequest' } },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/listings/my': {
      get: {
        tags: ['Listings'],
        security: bearerAuth,
        summary: 'List my listings',
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: paginated('listings') } },
          },
        },
      },
    },
    '/listings/{listingId}': {
      get: {
        tags: ['Listings'],
        security: bearerAuth,
        summary: 'Get my listing',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
      patch: {
        tags: ['Listings'],
        security: bearerAuth,
        summary: 'Update my listing',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/listings/{listingId}/publish': {
      post: {
        tags: ['Listings'],
        security: bearerAuth,
        summary: 'Publish listing (triggers matching)',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/listings/{listingId}/cancel': {
      post: {
        tags: ['Listings'],
        security: bearerAuth,
        summary: 'Cancel listing',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/listings/{listingId}/matches': {
      get: {
        tags: ['Matching'],
        security: bearerAuth,
        summary: 'Get buyer matches for listing',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/marketplace/listings': {
      get: {
        tags: ['Marketplace'],
        security: [],
        summary: 'Search published listings',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'region', in: 'query', schema: { type: 'string' } },
          { name: 'minQuantity', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'OK',
            content: { 'application/json': { schema: paginated('listings') } },
          },
        },
      },
    },
    '/marketplace/listings/{listingId}': {
      get: {
        tags: ['Marketplace'],
        security: [],
        summary: 'Get a marketplace listing',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buyers/profile': {
      post: {
        tags: ['Buyer Profiles'],
        security: bearerAuth,
        summary: 'Create buyer profile',
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: ['Buyer Profiles'],
        security: bearerAuth,
        summary: 'Get buyer profile',
        responses: { 200: { description: 'OK' } },
      },
      patch: {
        tags: ['Buyer Profiles'],
        security: bearerAuth,
        summary: 'Update buyer profile',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buyers/demands': {
      post: {
        tags: ['Buyer Profiles'],
        security: bearerAuth,
        summary: 'Create demand',
        responses: { 201: { description: 'Created' } },
      },
      get: {
        tags: ['Buyer Profiles'],
        security: bearerAuth,
        summary: 'List demands',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buyers/recommendations': {
      get: {
        tags: ['Matching'],
        security: bearerAuth,
        summary: 'Recommended listings for buyer',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/offers': {
      post: {
        tags: ['Offers'],
        security: bearerAuth,
        summary: 'Create an offer (buyer)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateOfferRequest' } },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/farmers/offers/{offerId}/accept': {
      post: {
        tags: ['Offers'],
        security: bearerAuth,
        summary: 'Accept an offer (farmer)',
        parameters: [{ name: 'offerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/farmers/offers/{offerId}/reject': {
      post: {
        tags: ['Offers'],
        security: bearerAuth,
        summary: 'Reject an offer (farmer)',
        parameters: [{ name: 'offerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buyers/offers/{offerId}/cancel': {
      post: {
        tags: ['Offers'],
        security: bearerAuth,
        summary: 'Cancel an offer (buyer)',
        parameters: [{ name: 'offerId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/farmers/transactions': {
      get: {
        tags: ['Transactions'],
        security: bearerAuth,
        summary: 'Farmer transactions',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/buyers/transactions': {
      get: {
        tags: ['Transactions'],
        security: bearerAuth,
        summary: 'Buyer transactions',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/farmers/transport-suggestions': {
      get: {
        tags: ['Matching'],
        security: bearerAuth,
        summary: 'Transport pool suggestions',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        security: bearerAuth,
        summary: 'List notifications',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        security: bearerAuth,
        summary: 'Unread count',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        security: bearerAuth,
        summary: 'Admin dashboard metrics',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        security: bearerAuth,
        summary: 'List users',
        responses: { 200: { description: 'OK' } },
      },
    },
    '/admin/listings/{listingId}/regenerate-matches': {
      post: {
        tags: ['Admin'],
        security: bearerAuth,
        summary: 'Regenerate matches',
        parameters: [{ name: 'listingId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        security: bearerAuth,
        summary: 'List audit logs',
        responses: { 200: { description: 'OK' } },
      },
    },
  },
} as const;
