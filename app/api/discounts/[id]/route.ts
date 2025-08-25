import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError } from '@/lib/errors'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/discounts/[id] - Get individual discount details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Find the discount by ID
    const discount = await prisma.seniorDiscount.findUnique({
      where: { id },
      select: {
        id: true,
        status: true, // Include status for debugging
        title: true,
        zip: true,
        category: true,
        minAge: true,
        endDate: true,
        sponsored: true,
        createdAt: true,
        sd: true, // Include the full JSON payload
      }
    })

    if (!discount) {
      console.log(`❌ Discount not found: ${id}`)
      return NextResponse.json(
        { error: 'Discount not found' },
        { status: 404 }
      )
    }

    console.log(`📋 Found discount: ${id}, status: ${discount.status}`)

    // For development/testing: allow both PENDING and PUBLISHED
    if (discount.status !== 'PUBLISHED' && discount.status !== 'PENDING') {
      console.log(`❌ Discount status not allowed: ${discount.status}`)
      return NextResponse.json(
        { error: 'Discount not available' },
        { status: 404 }
      )
    }

    // Check if discount has expired
    if (discount.endDate && new Date(discount.endDate) < new Date()) {
      console.log(`❌ Discount expired: ${id}`)
      return NextResponse.json(
        { error: 'Discount has expired' },
        { status: 404 }
      )
    }

    console.log(`✅ Returning discount: ${id}`)
    return NextResponse.json(discount)

  } catch (error) {
    console.error(`❌ Error fetching discount ${params.id}:`, error)
    return handleError(error, `/api/discounts/${params.id}`)
  }
}
