import { z } from 'zod'

// Base discount schema for form submission
export const DiscountBaseSchema = z.object({
  // Required fields
  business: z.string().min(1, 'Business name is required').max(100, 'Business name too long'),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  amount: z.string().min(1, 'Discount amount is required').max(50, 'Amount description too long'),
  minAge: z.enum(['50', '55', '60', '62', '65'], {
    required_error: 'Minimum age is required',
  }),
  scope: z.enum(['Nationwide', 'Specific locations', 'Online only'], {
    required_error: 'Scope is required',
  }),
  zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  proof: z
    .string()
    .url('Proof must be a valid URL')
    .max(500, 'Proof URL too long')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'Proof URL must start with http:// or https://',
    ),
  ownerConfirm: z.boolean().refine((val) => val === true, 'You must confirm you are the business owner'),
  tos: z.boolean().refine((val) => val === true, 'You must accept the terms of service'),
  
  // Optional fields
  days: z.string().max(120, 'Days description too long').optional(),
  code: z.string().max(60, 'Code too long').optional(),
  location: z.string().max(160, 'Location too long').optional(),
  website: z.string().url('Website must be a valid URL').max(500, 'Website URL too long').optional().or(z.literal('')),
  phone: z.string().max(25, 'Phone number too long').optional(),
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  notes: z.string().max(500, 'Notes too long').optional(),
  
  // Hidden honeypot field
  hp: z.string().max(0, 'Spam detected').optional(),
  
  // reCAPTCHA token
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification required'),
})

// Submit discount schema with refinements
export const SubmitDiscountSchema = DiscountBaseSchema
  .refine(
    (data) => {
      if (data.start && data.end) {
        return new Date(data.start) <= new Date(data.end)
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['end'],
    },
  )
  .refine(
    (data) => {
      // Check payload size
      const payloadSize = JSON.stringify(data).length
      const maxSize = parseInt(process.env.MAX_PAYLOAD_BYTES || '32768')
      return payloadSize < maxSize
    },
    {
      message: 'Payload size exceeds maximum allowed',
      path: ['payload'],
    },
  )

// SeniorDiscount model schema (database model)
export const SeniorDiscountSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(['PENDING', 'PUBLISHED', 'TRASH']),
  title: z.string(),
  sd: z.record(z.any()), // JSON payload
  
  // Shadow columns
  zip: z.string(),
  category: z.string(),
  minAge: z.number(),
  endDate: z.date().nullable(),
  sponsored: z.boolean(),
  
  // Duplicate guard fields
  businessNorm: z.string(),
  amountNorm: z.string(),
  createdDay: z.date(),
  
  createdIp: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Admin discount schema (includes status and metadata)
export const AdminDiscountSchema = SeniorDiscountSchema.extend({
  // Additional admin fields can be added here if needed
})

// Admin action schemas
export const ApproveDiscountSchema = z.object({
  id: z.string().cuid(),
  sponsored: z.boolean().optional(),
})

export const DenyDiscountSchema = z.object({
  id: z.string().cuid(),
  reason: z.string().min(1, 'Denial reason is required').max(500, 'Reason too long'),
})

// Query schemas
export const DiscountQuerySchema = z.object({
  zip: z.string().optional().refine((val) => !val || /^\d{5}$/.test(val), 'ZIP code must be 5 digits'),
  category: z.string().optional(),
  age: z.string().optional().refine((val) => !val || /^\d+$/.test(val), 'Age must be a number'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('30'),
})

export const AdminDiscountQuerySchema = z.object({
  status: z.enum(['pending', 'published', 'trash']).default('pending'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('30'),
})

// Response schemas
export const DiscountResponseSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  category: z.string(),
  amount: z.string(),
  minAge: z.number(),
  scope: z.string(),
  zip: z.string(),
  proof: z.string(),
  days: z.string().optional(),
  code: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  sponsored: z.boolean(),
  createdAt: z.string(),
  description: z.string(), // Built description field
})

export const DiscountsListResponseSchema = z.object({
  discounts: z.array(DiscountResponseSchema),
  totalCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
})

// Type exports
export type DiscountBase = z.infer<typeof DiscountBaseSchema>
export type SubmitDiscount = z.infer<typeof SubmitDiscountSchema>
export type SeniorDiscount = z.infer<typeof SeniorDiscountSchema>
export type AdminDiscount = z.infer<typeof AdminDiscountSchema>
export type DiscountResponse = z.infer<typeof DiscountResponseSchema>
export type DiscountsListResponse = z.infer<typeof DiscountsListResponseSchema>
export type DiscountQuery = z.infer<typeof DiscountQuerySchema>
export type AdminDiscountQuery = z.infer<typeof AdminDiscountQuerySchema>
