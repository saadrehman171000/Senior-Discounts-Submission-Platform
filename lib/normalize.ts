import type { SeniorDiscount, DiscountStatus } from '@prisma/client'
import type { DiscountResponse, DiscountsListResponse, DiscountBase } from './schemas'

/**
 * Normalize a Prisma SeniorDiscount model to API response format
 */
export function normalizeDiscount(discount: SeniorDiscount): DiscountResponse {
  // Extract data from the JSON payload
  const discountData = discount.sd as DiscountBase
  
  // Build description field
  const description = buildDescription(discountData)
  
  return {
    id: discount.id,
    businessName: discountData.business,
    category: discount.category,
    amount: discountData.amount,
    minAge: parseInt(discountData.minAge),
    scope: discountData.scope,
    zip: discount.zip,
    proof: discountData.proof,
    days: discountData.days || undefined,
    code: discountData.code || undefined,
    location: discountData.location || undefined,
    website: discountData.website || undefined,
    phone: discountData.phone || undefined,
    startDate: discountData.start || undefined,
    endDate: discountData.end || undefined,
    notes: discountData.notes || undefined,
    sponsored: discount.sponsored,
    createdAt: discount.createdAt.toISOString(),
    description,
  }
}

/**
 * Build description field: "{amount}{days? • days}{code? • Code: code}"
 */
export function buildDescription(data: DiscountBase): string {
  let description = data.amount
  
  if (data.days) {
    description += ` • ${data.days}`
  }
  
  if (data.code) {
    description += ` • Code: ${data.code}`
  }
  
  return description
}

/**
 * Normalize multiple discounts and create paginated response
 */
export function normalizeDiscountsList(
  discounts: SeniorDiscount[],
  totalCount: number,
  currentPage: number,
  limit: number
): DiscountsListResponse {
  const totalPages = Math.ceil(totalCount / limit)
  
  return {
    discounts: discounts.map(normalizeDiscount),
    totalCount,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  }
}

/**
 * Convert string status to Prisma enum
 */
export function normalizeStatus(status: string): DiscountStatus {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'PENDING'
    case 'published':
      return 'PUBLISHED'
    case 'trash':
      return 'TRASH'
    default:
      return 'PENDING'
  }
}

/**
 * Convert Prisma enum to string status
 */
export function denormalizeStatus(status: DiscountStatus): string {
  return status.toLowerCase()
}

/**
 * Normalize date strings to Date objects for database
 */
export function normalizeDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * Sanitize and normalize input data
 * Trim strings, collapse whitespace, lowercase for dedupe fields
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ')
}

/**
 * Validate ZIP code format
 */
export function isValidZip(zip: string): boolean {
  return /^\d{5}$/.test(zip)
}

/**
 * Validate age range
 */
export function isValidAge(age: number): boolean {
  return age >= 50 && age <= 100
}

/**
 * Check if discount is expired
 */
export function isExpired(discount: SeniorDiscount): boolean {
  if (!discount.endDate) return false
  return new Date() > discount.endDate
}

/**
 * Check if discount is active (published and not expired)
 */
export function isActive(discount: SeniorDiscount): boolean {
  return discount.status === 'PUBLISHED' && !isExpired(discount)
}

/**
 * Format business name for display
 */
export function formatBusinessName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`
  }
  return phone
}

/**
 * Generate normalized fields for duplicate guard
 * Trim strings, collapse whitespace, lowercase for dedupe fields
 */
export function generateNormalizedFields(data: DiscountBase) {
  return {
    businessNorm: sanitizeInput(data.business).toLowerCase(),
    amountNorm: sanitizeInput(data.amount).toLowerCase(),
    createdDay: new Date(new Date().setUTCHours(0, 0, 0, 0)), // Today UTC midnight
  }
}

/**
 * Generate title for the discount
 */
export function generateDiscountTitle(data: DiscountBase): string {
  return `${data.business} - ${data.amount}`
}

/**
 * Prepare data for database insertion
 */
export function prepareDiscountForInsert(
  data: DiscountBase,
  clientIp?: string
): {
  title: string
  sd: DiscountBase
  zip: string
  category: string
  minAge: number
  endDate: Date | null
  sponsored: boolean
  businessNorm: string
  amountNorm: string
  createdDay: Date
  createdIp: string | null
} {
  const normalizedFields = generateNormalizedFields(data)
  
  return {
    title: generateDiscountTitle(data),
    sd: data, // Store the full payload as JSON
    zip: data.zip,
    category: data.category,
    minAge: parseInt(data.minAge),
    endDate: data.end ? new Date(data.end) : null,
    sponsored: false, // Default to false
    businessNorm: normalizedFields.businessNorm,
    amountNorm: normalizedFields.amountNorm,
    createdDay: normalizedFields.createdDay,
    createdIp: clientIp || null,
  }
}
