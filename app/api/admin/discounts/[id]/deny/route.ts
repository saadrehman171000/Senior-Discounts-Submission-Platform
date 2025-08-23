import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { DenyDiscountSchema } from '@/lib/schemas'
import { bustListCache } from '@/lib/cache'
import { handleError, NotFoundError, ValidationError } from '@/lib/errors'

/**
 * POST /api/admin/discounts/[id]/deny - Deny a discount
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
    const { reason } = DenyDiscountSchema.parse({ id, ...body })

    // Check if discount exists
    const existingDiscount = await prisma.seniorDiscount.findUnique({
      where: { id }
    })

    if (!existingDiscount) {
      throw new NotFoundError('Discount not found')
    }

    // Get current discount data
    const currentData = existingDiscount.sd as any

    // Update status=trash, save denial_reason in sd
    const updatedData = {
      ...currentData,
      denial_reason: reason,
      denied_at: new Date().toISOString(),
      denied_by: adminUserId
    }

    // Update the discount
    const updatedDiscount = await prisma.seniorDiscount.update({
      where: { id },
      data: {
        status: 'TRASH',
        sd: updatedData,
        updatedAt: new Date()
      }
    })

    // Call bustListCache()
    bustListCache()

    // Return success response
    return NextResponse.json({
      success: true,
      discount: {
        id: updatedDiscount.id,
        status: updatedDiscount.status,
        updatedAt: updatedDiscount.updatedAt
      }
    })

  } catch (error) {
    return handleError(error, `/api/admin/discounts/${params.id}/deny`)
  }
}
