import nodemailer from 'nodemailer'
import type { SeniorDiscount } from '@prisma/client'
import type { DiscountBase } from './schemas'

/**
 * Email configuration and transporter setup
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  secure: true, // Use SSL/TLS
  port: 465,
})

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('Email configuration verified successfully')
    return true
  } catch (error) {
    console.error('Email configuration verification failed:', error)
    return false
  }
}

/**
 * Send new submission email as specified in Chunk 3
 */
export async function sendNewSubmissionEmail(p: {
  business: string
  zip: string
  category: string
  amount: string
  minAge: number
  scope: string
  start?: string
  end?: string
  proof: string
  created_ip?: string
  created_at?: string
}) {
  const subject = `[Owner Submission] ${p.business} – ${p.zip}`
  const text = `Category: ${p.category}
Amount: ${p.amount}
MinAge: ${p.minAge}
Scope: ${p.scope}
ZIP: ${p.zip}
Dates: ${p.start ?? '-'} to ${p.end ?? '-'}
Proof: ${p.proof}
IP: ${p.created_ip ?? '-'}
At: ${p.created_at ?? '-'}`

  try {
    await transporter.sendMail({ 
      to: process.env.EMAIL_USER, 
      from: process.env.MAIL_FROM, 
      subject, 
      text 
    })
    console.log('New submission email sent successfully')
    return true
  } catch (error) {
    console.error('Failed to send new submission email:', error)
    return false
  }
}

/**
 * Send new discount submission notification to moderators (enhanced version)
 */
export async function sendNewSubmissionNotification(discount: SeniorDiscount): Promise<boolean> {
  try {
    const discountData = discount.sd as DiscountBase
    
    const mailOptions = {
      from: process.env.MAIL_FROM || 'Senior Discounts <noreply@senior-discounts.com>',
      to: process.env.EMAIL_USER, // Send to admin email for now
      subject: 'New Senior Discount Submission - Review Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">New Discount Submission</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Business Details</h3>
            <p><strong>Business Name:</strong> ${discountData.business}</p>
            <p><strong>Category:</strong> ${discount.category}</p>
            <p><strong>Discount:</strong> ${discountData.amount}</p>
            <p><strong>Minimum Age:</strong> ${discountData.minAge}+</p>
            <p><strong>Scope:</strong> ${discountData.scope}</p>
            <p><strong>ZIP Code:</strong> ${discount.zip}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Additional Information</h3>
            ${discountData.days ? `<p><strong>Valid Days:</strong> ${discountData.days}</p>` : ''}
            ${discountData.code ? `<p><strong>Promo Code:</strong> ${discountData.code}</p>` : ''}
            ${discountData.location ? `<p><strong>Location:</strong> ${discountData.location}</p>` : ''}
            ${discountData.website ? `<p><strong>Website:</strong> <a href="${discountData.website}">${discountData.website}</a></p>` : ''}
            ${discountData.phone ? `<p><strong>Phone:</strong> ${discountData.phone}</p>` : ''}
            ${discountData.start ? `<p><strong>Start Date:</strong> ${discountData.start}</p>` : ''}
            ${discountData.end ? `<p><strong>End Date:</strong> ${discountData.end}</p>` : ''}
            ${discountData.notes ? `<p><strong>Notes:</strong> ${discountData.notes}</p>` : ''}
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Verification</h3>
            <p><strong>Proof URL:</strong> <a href="${discountData.proof}">${discountData.proof}</a></p>
            <p><strong>Submitted:</strong> ${discount.createdAt.toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${discount.createdIp || 'Not recorded'}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Submission
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            This is an automated notification from the Senior Discounts submission system.
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('New submission notification sent:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send new submission notification:', error)
    return false
  }
}

/**
 * Send discount approval notification to business owner
 */
export async function sendApprovalNotification(discount: SeniorDiscount): Promise<boolean> {
  try {
    const discountData = discount.sd as DiscountBase
    
    const mailOptions = {
      from: process.env.MAIL_FROM || 'Senior Discounts <noreply@senior-discounts.com>',
      to: process.env.EMAIL_USER, // Would be business owner email in real app
      subject: 'Your Senior Discount Has Been Published!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Discount Published! 🎉</h2>
          
          <p>Great news! Your senior discount submission has been approved and is now live on our platform.</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #065f46;">Published Discount Details</h3>
            <p><strong>Business:</strong> ${discountData.business}</p>
            <p><strong>Category:</strong> ${discount.category}</p>
            <p><strong>Discount:</strong> ${discountData.amount}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">PUBLISHED</span></p>
          </div>
          
          <p>Your discount is now visible to seniors in your area and will help them save money while supporting your business.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Discount
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Thank you for supporting seniors in your community!
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Approval notification sent:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send approval notification:', error)
    return false
  }
}

/**
 * Send discount rejection notification to business owner
 */
export async function sendRejectionNotification(
  discount: SeniorDiscount, 
  reason: string
): Promise<boolean> {
  try {
    const discountData = discount.sd as DiscountBase
    
    const mailOptions = {
      from: process.env.MAIL_FROM || 'Senior Discounts <noreply@senior-discounts.com>',
      to: process.env.EMAIL_USER, // Would be business owner email in real app
      subject: 'Senior Discount Submission Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Discount Submission Update</h2>
          
          <p>We've reviewed your senior discount submission and unfortunately, it could not be published at this time.</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #991b1b;">Submission Details</h3>
            <p><strong>Business:</strong> ${discountData.business}</p>
            <p><strong>Category:</strong> ${discount.category}</p>
            <p><strong>Discount:</strong> ${discountData.amount}</p>
            <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">NOT PUBLISHED</span></p>
          </div>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #991b1b;">Reason for Rejection</h3>
            <p>${reason}</p>
          </div>
          
          <p>You can submit a new discount at any time. Please ensure all information is accurate and complete.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/submit" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Submit New Discount
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            If you have questions, please contact our support team.
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Rejection notification sent:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send rejection notification:', error)
    return false
  }
}

/**
 * Send magic link for authentication
 */
export async function sendMagicLink(email: string, token: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.MAIL_FROM || 'Senior Discounts <noreply@senior-discounts.com>',
      to: email,
      subject: 'Sign in to Senior Discounts Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Sign in to Senior Discounts Admin</h2>
          
          <p>Click the button below to sign in to your admin account. This link will expire in 10 minutes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/api/auth/callback/email?token=${token}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign In
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this email, you can safely ignore it.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Senior Discounts Admin System
          </p>
        </div>
      `,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Magic link sent:', result.messageId)
    return true
  } catch (error) {
    console.error('Failed to send magic link:', error)
    return false
  }
}

/**
 * Email configuration constants
 */
export const EMAIL_CONFIG = {
  FROM: process.env.MAIL_FROM || 'Senior Discounts <noreply@senior-discounts.com>',
  ADMIN_EMAIL: process.env.EMAIL_USER,
  MAGIC_LINK_EXPIRY: 10 * 60 * 1000, // 10 minutes
} as const
