import { prisma } from './prisma'

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
