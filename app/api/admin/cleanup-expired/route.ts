import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'
import { cleanupExpiredDiscounts } from '@/lib/discount-management'
import { handleError } from '@/lib/errors'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/admin/cleanup-expired - Manually trigger expired discount cleanup
 */
export async function POST(request: NextRequest) {
  try {
    requireAdminFromRequest(request) // Require admin authentication

    // Perform the cleanup
    const result = await cleanupExpiredDiscounts()

    return NextResponse.json({
      success: true,
      message: result.message,
      cleaned: result.cleaned,
      expiredDiscounts: result.expiredDiscounts
    })

  } catch (error) {
    return handleError(error, '/api/admin/cleanup-expired')
  }
}
