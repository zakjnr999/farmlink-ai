import { BUYER_TYPE_OPTIONS } from '@/constants/buyer-types';

import { GHANA_REGION_NAMES } from '@/constants/ghana-regions';

import { PRODUCE_UNIT_IDS } from '@/constants/units';

import type { BuyerType, DemandFrequency } from '@/types/buyer';

import { z } from 'zod';



const buyerTypeValues = BUYER_TYPE_OPTIONS.map((o) => o.value) as [

  BuyerType,

  ...BuyerType[],

];



const demandFrequencyValues = [

  'daily',

  'weekly',

  'biweekly',

  'monthly',

  'seasonal',

  'custom',

] as const satisfies readonly DemandFrequency[];



export const businessIdentityStepSchema = z.object({

  businessName: z

    .string()

    .trim()

    .min(2, 'Enter your business or organisation name.'),

  buyerType: z.enum(buyerTypeValues, {

    errorMap: () => ({ message: 'Select the type of buyer you are.' }),

  }),

  description: z

    .string()

    .trim()

    .max(500, 'Keep your business description under 500 characters.')

    .optional()

    .or(z.literal('')),

  contactEmail: z

    .string()

    .trim()

    .email('Enter a valid email address.')

    .optional()

    .or(z.literal('')),

  contactPhone: z

    .string()

    .trim()

    .min(1, 'Enter a contact phone number.')

    .regex(

      /^(\+233|0)[235]\d{8}$/,

      'Enter a valid Ghana phone number (e.g. 0244123456).',

    ),

});



export const buyerLocationStepSchema = z.object({

  region: z.string().refine((value) => GHANA_REGION_NAMES.includes(value), {

    message: 'Select your region.',

  }),

  district: z.string().trim().min(2, 'Enter your district.'),

  town: z.string().trim().min(2, 'Enter your town or city.'),

  latitude: z

    .union([

      z.literal(''),

      z.coerce

        .number({ invalid_type_error: 'Enter a valid latitude.' })

        .min(-90)

        .max(90),

    ])

    .optional(),

  longitude: z

    .union([

      z.literal(''),

      z.coerce

        .number({ invalid_type_error: 'Enter a valid longitude.' })

        .min(-180)

        .max(180),

    ])

    .optional(),

  maxTravelDistanceKm: z

    .union([

      z.literal(''),

      z.coerce

        .number({ invalid_type_error: 'Enter a valid distance in km.' })

        .positive('Distance must be greater than zero.'),

    ])

    .optional(),

});



export const producePreferencesStepSchema = z.object({

  preferredProduce: z

    .array(z.string().trim().min(1))

    .min(1, 'Add at least one produce category you buy regularly.'),

  commonUnits: z

    .array(z.enum(PRODUCE_UNIT_IDS as [string, ...string[]]))

    .min(1, 'Select at least one unit you typically order in.'),

  typicalQuantityMin: z

    .union([

      z.literal(''),

      z.coerce

        .number({ invalid_type_error: 'Enter a minimum quantity.' })

        .positive('Minimum quantity must be greater than zero.'),

    ])

    .optional(),

  typicalQuantityMax: z

    .union([

      z.literal(''),

      z.coerce

        .number({ invalid_type_error: 'Enter a maximum quantity.' })

        .positive('Maximum quantity must be greater than zero.'),

    ])

    .optional(),

  purchaseFrequency: z.enum(demandFrequencyValues).optional(),

});



export const firstDemandStepBaseSchema = z.object({
    skipFirstDemand: z.boolean(),
    produceCategory: z.string().trim().optional(),
    quantityMin: z
      .union([
        z.literal(''),
        z.coerce
          .number({ invalid_type_error: 'Enter a minimum quantity.' })
          .positive('Minimum quantity must be greater than zero.'),
      ])
      .optional(),
    quantityMax: z
      .union([
        z.literal(''),
        z.coerce
          .number({ invalid_type_error: 'Enter a maximum quantity.' })
          .positive('Maximum quantity must be greater than zero.'),
      ])
      .optional(),
    unit: z.enum(PRODUCE_UNIT_IDS as [string, ...string[]]).optional(),
    requiredFrom: z.string().optional(),
    preferredRegions: z.array(z.string()).optional(),
    isRecurring: z.boolean().optional(),
    frequency: z.enum(demandFrequencyValues).optional(),
  });

export const firstDemandStepSchema = firstDemandStepBaseSchema.superRefine((data, ctx) => {

    if (data.skipFirstDemand) return;



    if (!data.produceCategory?.trim()) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Enter the produce you need.',

        path: ['produceCategory'],

      });

    }

    if (data.quantityMin === '' || data.quantityMin === undefined) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Enter a minimum quantity.',

        path: ['quantityMin'],

      });

    }

    if (data.quantityMax === '' || data.quantityMax === undefined) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Enter a maximum quantity.',

        path: ['quantityMax'],

      });

    }

    if (

      typeof data.quantityMin === 'number' &&

      typeof data.quantityMax === 'number' &&

      data.quantityMax < data.quantityMin

    ) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Maximum quantity must be at least the minimum.',

        path: ['quantityMax'],

      });

    }

    if (!data.unit) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Select a unit.',

        path: ['unit'],

      });

    }

    if (!data.requiredFrom) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Select when you need supply from.',

        path: ['requiredFrom'],

      });

    }

    if (!data.preferredRegions?.length) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Select at least one preferred region.',

        path: ['preferredRegions'],

      });

    }

    if (data.isRecurring && !data.frequency) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: 'Select how often you need this produce.',

        path: ['frequency'],

      });

    }

  });



export const buyerOnboardingSchema = businessIdentityStepSchema
  .merge(buyerLocationStepSchema)
  .merge(producePreferencesStepSchema)
  .merge(firstDemandStepBaseSchema);



export type BusinessIdentityStepValues = z.infer<typeof businessIdentityStepSchema>;

export type BuyerLocationStepValues = z.infer<typeof buyerLocationStepSchema>;

export type ProducePreferencesStepValues = z.infer<typeof producePreferencesStepSchema>;

export type FirstDemandStepValues = z.infer<typeof firstDemandStepSchema>;

export type BuyerOnboardingFormValues = z.infer<typeof buyerOnboardingSchema>;



export const BUYER_ONBOARDING_STEPS = [

  'business-identity',

  'location',

  'produce-preferences',

  'first-demand',

] as const;



export type BuyerOnboardingStep = (typeof BUYER_ONBOARDING_STEPS)[number];



export interface BuyerOnboardingProgress {

  step: BuyerOnboardingStep;

  data: Partial<BuyerOnboardingFormValues>;

  updatedAt: string;

}



export const BUYER_ONBOARDING_PROGRESS_KEY = 'farmlink-buyer-onboarding-progress';


