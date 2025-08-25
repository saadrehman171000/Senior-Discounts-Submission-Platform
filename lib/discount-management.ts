import { prisma } from './prisma'

/**
 * Automatically approve pending discounts that are older than 24 hours
 * This implements the auto-approval system for business submissions
 */
export async function autoApprovePendingDiscounts() {
  try {
    // Calculate the timestamp 24 hours ago
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    // Find all pending discounts older than 24 hours
    const pendingDiscounts = await prisma.seniorDiscount.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lte: twentyFourHoursAgo }
      },
      select: { 
        id: true, 
        title: true, 
        businessNorm: true,
        zip: true,
        category: true,
        createdAt: true 
      }
    })

    if (pendingDiscounts.length === 0) {
      return { approved: 0, message: 'No pending discounts ready for auto-approval' }
    }

    // Update pending discounts to PUBLISHED status
    const result = await prisma.seniorDiscount.updateMany({
      where: {
        id: { in: pendingDiscounts.map(d => d.id) }
      },
      data: {
        status: 'PUBLISHED'
      }
    })

    // Log the auto-approval for monitoring
    console.log(`✅ Auto-approval: Approved ${result.count} pending discounts after 24 hours`)
    
    // Log specific approved discounts for debugging
    pendingDiscounts.forEach(discount => {
      console.log(`  - "${discount.title}" (${discount.category}) in ${discount.zip} - Auto-approved`)
    })

    return { 
      approved: result.count, 
      message: `Successfully auto-approved ${result.count} pending discounts`,
      approvedDiscounts: pendingDiscounts.map(d => ({ 
        id: d.id, 
        title: d.title, 
        businessNorm: d.businessNorm,
        zip: d.zip,
        category: d.category,
        createdAt: d.createdAt 
      }))
    }

  } catch (error) {
    console.error('❌ Error during auto-approval of pending discounts:', error)
    throw new Error('Failed to auto-approve pending discounts')
  }
}

/**
 * Get count of pending discounts that are ready for auto-approval (older than 24 hours)
 */
export async function getPendingDiscountsReadyForApproval() {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    const count = await prisma.seniorDiscount.count({
      where: {
        status: 'PENDING',
        createdAt: { lte: twentyFourHoursAgo }
      }
    })
    
    return count
  } catch (error) {
    console.error('❌ Error getting pending discounts ready for approval count:', error)
    return 0
  }
}

/**
 * Get list of pending discounts that are ready for auto-approval
 */
export async function getPendingDiscountsReadyForApprovalList() {
  try {
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    const pendingReady = await prisma.seniorDiscount.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lte: twentyFourHoursAgo }
      },
      select: {
        id: true,
        title: true,
        businessNorm: true,
        zip: true,
        category: true,
        minAge: true,
        createdAt: true,
        createdIp: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    return pendingReady
  } catch (error) {
    console.error('❌ Error getting pending discounts ready for approval list:', error)
    return []
  }
}

/**
 * Automatically move expired discounts to TRASH status
 * This ensures the discount list stays clean and current
 */
export async function cleanupExpiredDiscounts() {
  try {
    // Find all published discounts that have expired
    const expiredDiscounts = await prisma.seniorDiscount.findMany({
      where: {
        status: 'PUBLISHED',
        endDate: { lte: new Date() } // Expired
      },
      select: { id: true, title: true, endDate: true }
    })

    if (expiredDiscounts.length === 0) {
      return { cleaned: 0, message: 'No expired discounts found' }
    }

    // Update expired discounts to TRASH status
    const result = await prisma.seniorDiscount.updateMany({
      where: {
        id: { in: expiredDiscounts.map(d => d.id) }
      },
      data: {
        status: 'TRASH'
      }
    })

    // Log the cleanup for monitoring
    console.log(`🕒 Auto-cleanup: Moved ${result.count} expired discounts to TRASH`)
    
    // Log specific expired discounts for debugging
    expiredDiscounts.forEach(discount => {
      console.log(`  - "${discount.title}" expired on ${discount.endDate?.toISOString()}`)
    })

    return { 
      cleaned: result.count, 
      message: `Successfully moved ${result.count} expired discounts to TRASH`,
      expiredDiscounts: expiredDiscounts.map(d => ({ id: d.id, title: d.title, endDate: d.endDate }))
    }

  } catch (error) {
    console.error('❌ Error during expired discount cleanup:', error)
    throw new Error('Failed to cleanup expired discounts')
  }
}

/**
 * Get count of expired discounts that need cleanup
 */
export async function getExpiredDiscountsCount() {
  try {
    const count = await prisma.seniorDiscount.count({
      where: {
        status: 'PUBLISHED',
        endDate: { lte: new Date() } // Expired
      }
    })
    
    return count
  } catch (error) {
    console.error('❌ Error getting expired discounts count:', error)
    return 0
  }
}

/**
 * Get list of discounts that will expire soon (within next 7 days)
 */
export async function getExpiringSoonDiscounts() {
  try {
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    
    const expiringSoon = await prisma.seniorDiscount.findMany({
      where: {
        status: 'PUBLISHED',
        endDate: {
          gte: new Date(),
          lte: sevenDaysFromNow
        }
      },
      select: {
        id: true,
        title: true,
        endDate: true,
        category: true,
        zip: true
      },
      orderBy: {
        endDate: 'asc'
      }
    })
    
    return expiringSoon
  } catch (error) {
    console.error('❌ Error getting expiring soon discounts:', error)
    return []
  }
}
