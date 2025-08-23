import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { AdminDiscountQuerySchema } from '@/lib/schemas'
import { handleError, ValidationError } from '@/lib/errors'

/**
 * GET /api/admin/discounts - List all discounts for admin
 */
export async function GET(request: NextRequest) {
  try {
    // Require requireAdmin()
    const adminUserId = requireAdmin()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = AdminDiscountQuerySchema.parse(Object.fromEntries(searchParams))

    // Build where clause based on status
    const where: any = {}
    if (query.status === 'pending') {
      where.status = 'PENDING'
    } else if (query.status === 'published') {
      where.status = 'PUBLISHED'
    } else if (query.status === 'trash') {
      where.status = 'TRASH'
    }

    // Get total count
    const totalCount = await prisma.seniorDiscount.count({ where })

    // Calculate pagination
    const page = query.page
    const limit = query.limit
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(totalCount / limit)

    // Get discounts with minimal fields + sd blob
    const discounts = await prisma.seniorDiscount.findMany({
      where,
      select: {
        id: true,
        status: true,
        title: true,
        zip: true,
        category: true,
        minAge: true,
        endDate: true,
        sponsored: true,
        createdAt: true,
        updatedAt: true,
        sd: true, // Include the full JSON payload
        businessNorm: true,
        amountNorm: true,
        createdDay: true,
        createdIp: true,
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Return minimal fields + sd blob
    const result = {
      items: discounts.map(discount => ({
        id: discount.id,
        status: discount.status,
        title: discount.title,
        zip: discount.zip,
        category: discount.category,
        minAge: discount.minAge,
        endDate: discount.endDate,
        sponsored: discount.sponsored,
        createdAt: discount.createdAt,
        updatedAt: discount.updatedAt,
        sd: discount.sd, // Full JSON payload
        businessNorm: discount.businessNorm,
        amountNorm: discount.amountNorm,
        createdDay: discount.createdDay,
        createdIp: discount.createdIp,
      })),
      page,
      total: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    return NextResponse.json(result)

  } catch (error) {
    return handleError(error, '/api/admin/discounts')
  }
}
