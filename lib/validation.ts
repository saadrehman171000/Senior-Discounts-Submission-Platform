import { z } from "zod"

export const OwnerSubmitSchema = z
  .object({
    // Required fields
    business: z.string().min(1, "Business name is required").max(100, "Business name too long"),
    category: z.string().min(1, "Category is required"),
    amount: z.string().min(1, "Discount amount is required").max(50, "Amount description too long"),
    minAge: z.enum(["50", "55", "60", "62", "65"], {
      required_error: "Minimum age is required",
    }),
    scope: z.enum(["Nationwide", "Specific locations", "Online only"], {
      required_error: "Scope is required",
    }),
    zip: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
    proof: z
      .string()
      .url("Proof must be a valid URL")
      .refine(
        (url) => url.startsWith("http://") || url.startsWith("https://"),
        "Proof URL must start with http:// or https://",
      ),
    ownerConfirm: z.boolean().refine((val) => val === true, "You must confirm you are the business owner"),
    tos: z.boolean().refine((val) => val === true, "You must accept the terms of service"),

    // Optional fields
    days: z.string().max(120, "Days description too long").optional(),
    code: z.string().max(60, "Code too long").optional(),
    location: z.string().max(160, "Location too long").optional(),
    website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
    phone: z.string().max(25, "Phone number too long").optional(),
    start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD format")
      .optional()
      .or(z.literal("")),
    end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD format")
      .optional()
      .or(z.literal("")),
    notes: z.string().max(500, "Notes too long").optional(),

    // Hidden honeypot field
    hp: z.string().max(0, "Spam detected").optional(),
    
    // reCAPTCHA token (disabled - not required)
    recaptchaToken: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        return new Date(data.start) <= new Date(data.end)
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["end"],
    },
  )

export type OwnerSubmitData = z.infer<typeof OwnerSubmitSchema>

export const categories = [
  "Restaurants & Food",
  "Groceries",
  "Retail & Shopping",
  "Healthcare & Medical",
  "Travel & Lodging",
  "Entertainment",
  "Services",
  "Automotive",
  "Technology",
  "Home & Garden",
  "Other",
]

export const ageOptions = ["50", "55", "60", "62", "65"]
export const scopeOptions = ["Nationwide", "Specific locations", "Online only"]

// Backend response types
export interface DiscountResponse {
  id: string
  businessName: string
  category: string
  amount: string
  minAge: number
  scope: string
  zip: string
  proof: string
  days?: string
  code?: string
  location?: string
  website?: string
  phone?: string
  startDate?: string
  endDate?: string
  notes?: string
  sponsored: boolean
  createdAt: string
  description: string
}

export interface DiscountsListResponse {
  items: DiscountResponse[]
  page: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}
