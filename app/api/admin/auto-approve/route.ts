import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { autoApprovePendingDiscounts } from '@/lib/discount-management'
import { handleError } from '@/lib/errors'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/auto-approve - Manually trigger auto-approval of pending discounts
 */
export async function POST(request: NextRequest) {
  try {
    requireAdminFromRequest(request) // Require admin authentication

    // Trigger auto-approval of pending discounts older than 24 hours
    const result = await autoApprovePendingDiscounts()

    return NextResponse.json({
      success: true,
      message: result.message,
      approved: result.approved,
      approvedDiscounts: result.approvedDiscounts
    })

  } catch (error) {
    return handleError(error, '/api/admin/auto-approve')
  }
}
