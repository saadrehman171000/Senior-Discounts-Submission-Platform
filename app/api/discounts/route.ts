import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SubmitDiscountSchema, DiscountQuerySchema } from '@/lib/schemas'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { sendNewSubmissionEmail } from '@/lib/email'
import { prepareDiscountForInsert, normalizeDiscountsList } from '@/lib/normalize'
import { cacheList, bustListCache } from '@/lib/cache'
import { handleError, ValidationError, RecaptchaError, ConflictError } from '@/lib/errors'
import { validateContentType, validatePayloadSize, sanitizeDiscountData } from '@/lib/security'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * POST /api/discounts - Submit new discount
 */
export async function POST(request: NextRequest) {
  try {
    // Reject non-JSON or > MAX_PAYLOAD_BYTES
    const contentType = request.headers.get('content-type')
    if (!validateContentType(contentType)) {
      throw new ValidationError('Content-Type must be application/json')
    }

    const body = await request.json()
    
    // Check payload size with security validation
    const payloadValidation = validatePayloadSize(body)
    if (!payloadValidation.valid) {
      throw new ValidationError(
        `Payload size ${payloadValidation.size} exceeds maximum allowed ${payloadValidation.maxSize}`
      )
    }

    // Sanitize all text before persisting
    const sanitizedBody = sanitizeDiscountData(body)
    
    // Validate with OwnerSubmitSchema
    const validatedData = SubmitDiscountSchema.parse(sanitizedBody)

    // Require honeypot empty
    if (validatedData.hp && validatedData.hp.length > 0) {
      throw new ValidationError('Spam detected')
    }

    // Verify reCAPTCHA (score ≥ 0.4)
    const recaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken, 'submit_discount', 0.4)
    if (!recaptchaValid) {
      throw new RecaptchaError('reCAPTCHA verification failed')
    }

    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    request.headers.get('x-real-ip') || 
                    request.ip || 
                    'unknown'

    // Normalize payload: set sponsored=0, ownerConfirm=1, tos=1, add created_ip, created_at
    const insertData = prepareDiscountForInsert(validatedData, clientIp)

    try {
      // Insert row with dedupe guard fields
      const discount = await prisma.seniorDiscount.create({
        data: insertData
      })

      // Send moderator email
      await sendNewSubmissionEmail({
        business: validatedData.business,
        zip: validatedData.zip,
        category: validatedData.category,
        amount: validatedData.amount,
        minAge: parseInt(validatedData.minAge),
        scope: validatedData.scope,
        start: validatedData.start,
        end: validatedData.end,
        proof: validatedData.proof,
        created_ip: clientIp,
        created_at: new Date().toISOString()
      })

      // Bust cache
      bustListCache()

      // Return 201 { id, status: "pending" }
      return NextResponse.json({
        id: discount.id,
        status: "pending"
      }, { status: 201 })

    } catch (dbError: any) {
      // If unique constraint violation, return 409 { error: "Duplicate today" }
      if (dbError.code === 'P2002' && dbError.meta?.target?.includes('businessNorm')) {
        throw new ConflictError('Duplicate today', { 
          message: 'A similar discount from this business has already been submitted today',
          suggestion: 'Please wait until tomorrow to submit another discount'
        })
      }
      throw dbError
    }

  } catch (error) {
    return handleError(error, '/api/discounts')
  }
}

/**
 * GET /api/discounts - List public discounts
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters and filter out empty strings
    const { searchParams } = new URL(request.url)
    const rawParams = Object.fromEntries(searchParams)
    
    // Filter out empty string values
    const cleanParams = Object.entries(rawParams).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)
    
    const query = DiscountQuerySchema.parse(cleanParams)

    // Cache per query (60s)
    const cacheKey = `discounts:${JSON.stringify(query)}`
    
    const result = await cacheList(cacheKey, async () => {
      // Build where clause: only published, not expired
      const where = {
        status: 'PUBLISHED',
        OR: [
          { endDate: null }, // No end date
          { endDate: { gt: new Date() } } // Not expired
        ]
      }

      // Add filters
      if (query.zip) {
        where.zip = query.zip
      }
      if (query.category && query.category !== 'all') {
        where.category = query.category
      }
      if (query.age) {
        where.minAge = { lte: parseInt(query.age) }
      }

      // Get total count
      const totalCount = await prisma.seniorDiscount.count({ where })

      // Calculate pagination
      const page = query.page
      const limit = query.limit
      const skip = (page - 1) * limit
      const totalPages = Math.ceil(totalCount / limit)

      // Get discounts: sort sponsored first, then createdAt desc
      const discounts = await prisma.seniorDiscount.findMany({
        where,
        orderBy: [
          { sponsored: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      })

      return {
        items: discounts.map(discount => ({
          id: discount.id,
          title: discount.title,
          zip: discount.zip,
          category: discount.category,
          minAge: discount.minAge,
          endDate: discount.endDate,
          sponsored: discount.sponsored,
          createdAt: discount.createdAt,
          sd: discount.sd // Include the full JSON payload
        })),
        page,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    return handleError(error, '/api/discounts')
  }
}
