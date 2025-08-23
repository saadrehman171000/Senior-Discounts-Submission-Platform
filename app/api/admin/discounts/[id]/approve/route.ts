import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { ApproveDiscountSchema } from '@/lib/schemas'
import { bustListCache } from '@/lib/cache'
import { handleError, NotFoundError, ValidationError } from '@/lib/errors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/discounts/[id]/approve - Approve a discount
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require requireAdmin()
    const adminUserId = requireAdmin()

    // Validate discount ID
    const { id } = params
    if (!id) {
      throw new ValidationError('Discount ID is required')
    }

    // Parse request body
    const body = await request.json()
    const { sponsored } = ApproveDiscountSchema.parse({ id, ...body })

    // Check if discount exists
    const existingDiscount = await prisma.seniorDiscount.findUnique({
      where: { id }
    })

    if (!existingDiscount) {
      throw new NotFoundError('Discount not found')
    }

    // Update status=published, update sponsored if provided, sync shadow columns
    const updateData: any = {
      status: 'PUBLISHED',
      updatedAt: new Date()
    }

    if (sponsored !== undefined) {
      updateData.sponsored = sponsored
    }

    // Update the discount
    const updatedDiscount = await prisma.seniorDiscount.update({
      where: { id },
      data: updateData
    })

    // Call bustListCache()
    bustListCache()

    // Return success response
    return NextResponse.json({
      success: true,
      discount: {
        id: updatedDiscount.id,
        status: updatedDiscount.status,
        sponsored: updatedDiscount.sponsored,
        updatedAt: updatedDiscount.updatedAt
      }
    })

  } catch (error) {
    return handleError(error, `/api/admin/discounts/${params.id}/approve`)
  }
}
