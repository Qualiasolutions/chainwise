import { createClient } from '@/lib/supabase/server'
import { createClient as createClientSide } from '@/lib/supabase/client'
import nodemailer from 'nodemailer'

export interface NotificationPayload {
  userId: string
  type: 'alert_triggered' | 'portfolio_update' | 'system_notification' | 'trading_signal' | 'ai_insight'
  title: string
  message: string
  metadata?: any
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface EmailNotification extends NotificationPayload {
  email: string
  template: string
}

export interface InAppNotification extends NotificationPayload {
  read: boolean
  expiresAt?: Date
}

export class NotificationService {
  private static transporter: nodemailer.Transporter | null = null

  /**
   * Initialize email transporter
   */
  static initializeEmailTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      })
    }
    return this.transporter
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(notification: EmailNotification): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.initializeEmailTransporter()
      }

      if (!this.transporter) {
        console.error('Email transporter not initialized')
        return false
      }

      const emailTemplate = this.getEmailTemplate(notification.template, notification)

      const mailOptions = {
        from: `"ChainWise" <${process.env.SMTP_USER}>`,
        to: notification.email,
        subject: notification.title,
        html: emailTemplate,
      }

      const result = await this.transporter.sendMail(mailOptions)

      // Log the email notification
      const supabase = await createClient()
      await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          channel: 'email',
          status: 'sent',
          metadata: {
            emailId: result.messageId,
            template: notification.template,
            ...notification.metadata
          }
        })

      return true
    } catch (error) {
      console.error('Error sending email notification:', error)

      // Log the failed notification
      const supabase = await createClient()
      await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          channel: 'email',
          status: 'failed',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            template: notification.template,
            ...notification.metadata
          }
        })

      return false
    }
  }

  /**
   * Send in-app notification
   */
  static async sendInAppNotification(notification: InAppNotification): Promise<boolean> {
    try {
      const supabase = await createClient()
      await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          channel: 'in_app',
          status: 'sent',
          read: notification.read,
          expires_at: notification.expiresAt?.toISOString(),
          metadata: notification.metadata
        })

      return true
    } catch (error) {
      console.error('Error sending in-app notification:', error)
      return false
    }
  }

  /**
   * Send alert notification (both email and in-app)
   */
  static async sendAlertNotification(
    userId: string,
    alertData: {
      symbol: string
      alertType: string
      targetValue: number
      currentValue: number
      message: string
    }
  ): Promise<{ emailSent: boolean; inAppSent: boolean }> {
    try {
      // Get user preferences and email
      const supabase = createAdminClient()
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, preferences')
        .eq('id', userId)
        .single()
      
      if (userError) {
        console.error('Error fetching user:', userError)
        return { emailSent: false, inAppSent: false }
      }

      if (!user) {
        return { emailSent: false, inAppSent: false }
      }

      const preferences = user.preferences as any || {}
      const emailNotifications = preferences.emailNotifications !== false // Default to true
      const inAppNotifications = preferences.inAppNotifications !== false // Default to true

      const title = `🚨 Alert: ${alertData.symbol} ${alertData.alertType.replace('_', ' ').toUpperCase()}`
      const message = alertData.message

      let emailSent = false
      let inAppSent = false

      // Send email notification if enabled
      if (emailNotifications && user.email) {
        emailSent = await this.sendEmailNotification({
          userId,
          type: 'alert_triggered',
          title,
          message,
          email: user.email,
          template: 'alert_triggered',
          priority: 'high',
          metadata: {
            symbol: alertData.symbol,
            alertType: alertData.alertType,
            targetValue: alertData.targetValue,
            currentValue: alertData.currentValue
          }
        })
      }

      // Send in-app notification if enabled
      if (inAppNotifications) {
        inAppSent = await this.sendInAppNotification({
          userId,
          type: 'alert_triggered',
          title,
          message,
          read: false,
          priority: 'high',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          metadata: {
            symbol: alertData.symbol,
            alertType: alertData.alertType,
            targetValue: alertData.targetValue,
            currentValue: alertData.currentValue
          }
        })
      }

      return { emailSent, inAppSent }
    } catch (error) {
      console.error('Error sending alert notification:', error)
      return { emailSent: false, inAppSent: false }
    }
  }

  /**
   * Get email template
   */
  private static getEmailTemplate(template: string, notification: EmailNotification): string {
    const baseStyles = `
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    `

    switch (template) {
      case 'alert_triggered':
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>🚨 Price Alert Triggered</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2>${notification.title}</h2>
                <p>${notification.message}</p>
              </div>

              <p>Hello ChainWise user,</p>
              <p>One of your price alerts has been triggered with the following details:</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
                ${Object.entries(notification.metadata || {}).map(([key, value]) => `
                  <p><strong>${key}:</strong> ${value}</p>
                `).join('')}
              </div>

              <p>Don't miss out on market opportunities. Stay ahead with ChainWise's advanced analytics.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portfolio" class="button">View Your Portfolio</a>
              </div>
            </div>
            <div class="footer">
              <p>This alert was sent by ChainWise - Your AI-Powered Crypto Companion</p>
              <p>You can manage your notification preferences in your account settings.</p>
            </div>
          </div>
        `

      case 'portfolio_update':
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>📊 Portfolio Update</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/portfolio" class="button">View Portfolio Analytics</a>
              </div>
            </div>
            <div class="footer">
              <p>ChainWise - Advanced Portfolio Analytics</p>
            </div>
          </div>
        `

      case 'system_notification':
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>ℹ️ System Notification</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p>ChainWise - Your AI-Powered Crypto Companion</p>
            </div>
          </div>
        `

      default:
        return `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>📬 ChainWise Notification</h1>
            </div>
            <div class="content">
              <h2>${notification.title}</h2>
              <p>${notification.message}</p>
            </div>
            <div class="footer">
              <p>ChainWise - Advanced Crypto Analytics</p>
            </div>
          </div>
        `
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: {
      channel?: 'email' | 'in_app' | 'all'
      read?: boolean
      limit?: number
      offset?: number
    } = {}
  ) {
    const {
      channel = 'all',
      read,
      limit = 50,
      offset = 0
    } = options

    const where: any = { userId }

    if (channel !== 'all') {
      where.channel = channel
    }

    if (read !== undefined) {
      where.read = read
    }

    const supabase = createAdminClient()
    
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (channel !== 'all') {
      query = query.eq('channel', channel)
    }
    
    if (read !== undefined) {
      query = query.eq('read', read)
    }
    
    const { data: notifications, count: total, error } = await query
    
    if (error) {
      console.error('Error fetching notifications:', error)
      return {
        notifications: [],
        pagination: { total: 0, limit, offset, hasMore: false }
      }
    }

    return {
      notifications: notifications || [],
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: offset + limit < (total || 0)
      }
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const supabase = createAdminClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .eq('channel', 'in_app')
      
      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const supabase = createAdminClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .eq('read', false)
      
      if (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const supabase = createAdminClient()
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .eq('read', false)
      
      if (error) {
        console.error('Error getting unread count:', error)
        return 0
      }
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  /**
   * Clean up expired notifications
   */
  static async cleanupExpiredNotifications(): Promise<number> {
    try {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from('notifications')
        .delete({ count: 'exact' })
        .lt('expires_at', new Date().toISOString())
      
      if (error) {
        console.error('Error cleaning up expired notifications:', error)
        return 0
      }
      return data?.length || 0
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error)
      return 0
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean
      inAppNotifications?: boolean
      alertEmailFrequency?: 'immediate' | 'daily' | 'weekly'
      portfolioUpdateFrequency?: 'immediate' | 'daily' | 'weekly'
    }
  ): Promise<boolean> {
    try {
      const supabase = createAdminClient()
      
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single()

      if (fetchError || !user) {
        console.error('Error fetching user preferences:', fetchError)
        return false
      }

      const currentPreferences = (user.preferences as any) || {}
      const updatedPreferences = { ...currentPreferences, ...preferences }

      const { error: updateError } = await supabase
        .from('users')
        .update({ preferences: updatedPreferences })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Error updating notification preferences:', updateError)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating notification preferences:', error)
      return false
    }
  }
}
