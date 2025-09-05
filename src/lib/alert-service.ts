import { createClient } from '@/lib/supabase/server'
import { CryptoService } from '@/lib/crypto-service'

export interface AlertTrigger {
  alertId: string
  userId: string
  cryptoId: string
  symbol: string
  alertType: string
  targetValue: number
  currentValue: number
  message?: string
  triggeredAt: Date
}

export interface AlertCheckResult {
  triggered: AlertTrigger[]
  checked: number
  errors: string[]
}

export class AlertService {
  /**
   * Check all active alerts against current market data
   */
  static async checkAllAlerts(): Promise<AlertCheckResult> {
    const result: AlertCheckResult = {
      triggered: [],
      checked: 0,
      errors: []
    }

    try {
      const supabase = createClient()
      
      // Get all active alerts
      const { data: activeAlerts, error: alertsError } = await supabase
        .from('user_alerts')
        .select(`
          *,
          users!user_alerts_user_id_fkey(
            id,
            email,
            subscription_tier
          )
        `)
        .eq('is_active', true)
        .is('deleted_at', null)

      if (alertsError || !activeAlerts) {
        result.errors.push(`Failed to fetch active alerts: ${alertsError?.message}`)
        return result
      }

      result.checked = activeAlerts.length

      if (activeAlerts.length === 0) {
        return result
      }

      // Get unique crypto IDs
      const cryptoIds = [...new Set(activeAlerts.map(alert => alert.crypto_id))]

      // Get current prices for all cryptos
      const priceData = await CryptoService.getCurrentPrices(cryptoIds)

      // Check each alert
      for (const alert of activeAlerts) {
        try {
          const currentPrice = priceData[alert.crypto_id]?.price

          if (!currentPrice) {
            result.errors.push(`No price data for ${alert.symbol} (${alert.crypto_id})`)
            continue
          }

          const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice)

          if (shouldTrigger) {
            const trigger: AlertTrigger = {
              alertId: alert.id,
              userId: alert.user_id,
              cryptoId: alert.crypto_id,
              symbol: alert.symbol,
              alertType: alert.alert_type,
              targetValue: parseFloat(alert.target_value),
              currentValue: currentPrice,
              message: alert.message || this.generateDefaultMessage(alert, currentPrice),
              triggeredAt: new Date()
            }

            result.triggered.push(trigger)

            // Update alert as triggered (prevent duplicate notifications)
            await supabase
              .from('user_alerts')
              .update({
                last_triggered: new Date().toISOString(),
                // Optionally deactivate one-time alerts
                // is_active: false
              })
              .eq('id', alert.id)

            // Log the trigger
            await supabase
              .from('user_activity_logs')
              .insert({
                user_id: alert.user_id,
                action: 'alert_triggered',
                entity_type: 'alert',
                entity_id: alert.id,
                metadata: {
                  cryptoId: alert.crypto_id,
                  symbol: alert.symbol,
                  alertType: alert.alert_type,
                  targetValue: parseFloat(alert.target_value),
                  currentValue: currentPrice
                }
              })
          }
        } catch (error) {
          console.error(`Error checking alert ${alert.id}:`, error)
          result.errors.push(`Error checking alert ${alert.id}: ${error}`)
        }
      }

    } catch (error) {
      console.error('Error in alert checking process:', error)
      result.errors.push(`Alert checking process error: ${error}`)
    }

    return result
  }

  /**
   * Check if an alert should be triggered based on current price
   */
  private static shouldTriggerAlert(alert: any, currentPrice: number): boolean {
    const targetValue = parseFloat(alert.target_value)

    switch (alert.alert_type) {
      case 'price_above':
        return currentPrice >= targetValue

      case 'price_below':
        return currentPrice <= targetValue

      case 'percentage_change':
        // For percentage change alerts, we need historical data
        // This is a simplified version - in production, you'd check against a baseline price
        return Math.abs(currentPrice - targetValue) / targetValue >= 0.05 // 5% change

      case 'volume_spike':
        // Volume alerts would require volume data from the API
        // This is a placeholder implementation
        return false // Not implemented yet

      case 'market_cap_change':
        // Market cap alerts would require market cap data
        // This is a placeholder implementation
        return false // Not implemented yet

      default:
        return false
    }
  }

  /**
   * Generate a default message for alert triggers
   */
  private static generateDefaultMessage(alert: any, currentPrice: number): string {
    const targetValue = parseFloat(alert.target_value)
    const symbol = alert.symbol

    switch (alert.alert_type) {
      case 'price_above':
        return `${symbol} has reached $${currentPrice.toFixed(2)}, above your target of $${targetValue.toFixed(2)}`

      case 'price_below':
        return `${symbol} has dropped to $${currentPrice.toFixed(2)}, below your target of $${targetValue.toFixed(2)}`

      case 'percentage_change':
        const changePercent = ((currentPrice - targetValue) / targetValue * 100)
        const direction = changePercent > 0 ? 'increased' : 'decreased'
        return `${symbol} has ${direction} by ${Math.abs(changePercent).toFixed(2)}% to $${currentPrice.toFixed(2)}`

      default:
        return `${symbol} alert triggered: Current price $${currentPrice.toFixed(2)}`
    }
  }

  /**
   * Get alerts for a specific user
   */
  static async getUserAlerts(userId: string, activeOnly = true) {
    const supabase = createClient()
    
    let query = supabase
      .from('user_alerts')
      .select(`
        *,
        users!user_alerts_user_id_fkey(
          subscription_tier
        )
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch user alerts: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get alert statistics for a user
   */
  static async getUserAlertStats(userId: string) {
    const supabase = createClient()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [
      { count: totalAlerts },
      { count: activeAlerts },
      { count: triggeredToday },
      { count: triggeredThisWeek }
    ] = await Promise.all([
      supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)
        .is('deleted_at', null),
      supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('last_triggered', today.toISOString()),
      supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('last_triggered', weekAgo.toISOString())
    ])

    return {
      total: totalAlerts || 0,
      active: activeAlerts || 0,
      triggeredToday: triggeredToday || 0,
      triggeredThisWeek: triggeredThisWeek || 0
    }
  }

  /**
   * Create a new alert with validation
   */
  static async createAlert(
    userId: string,
    alertData: {
      cryptoId: string
      symbol: string
      alertType: string
      targetValue: number
      message?: string
      isActive?: boolean
    }
  ) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('user_alerts')
      .insert({
        user_id: userId,
        crypto_id: alertData.cryptoId,
        symbol: alertData.symbol,
        alert_type: alertData.alertType,
        target_value: alertData.targetValue.toString(),
        message: alertData.message,
        is_active: alertData.isActive ?? true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create alert: ${error.message}`)
    }

    return data
  }

  /**
   * Update an existing alert
   */
  static async updateAlert(
    alertId: string,
    userId: string,
    updates: Partial<{
      cryptoId: string
      symbol: string
      alertType: string
      targetValue: number
      message: string
      isActive: boolean
    }>
  ) {
    const supabase = createClient()
    
    const data: any = {}

    // Convert camelCase to snake_case
    if (updates.cryptoId !== undefined) data.crypto_id = updates.cryptoId
    if (updates.symbol !== undefined) data.symbol = updates.symbol
    if (updates.alertType !== undefined) data.alert_type = updates.alertType
    if (updates.targetValue !== undefined) data.target_value = updates.targetValue.toString()
    if (updates.message !== undefined) data.message = updates.message
    if (updates.isActive !== undefined) data.is_active = updates.isActive

    const { data: result, error } = await supabase
      .from('user_alerts')
      .update(data)
      .eq('id', alertId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()

    if (error) {
      throw new Error(`Failed to update alert: ${error.message}`)
    }

    return result
  }

  /**
   * Delete (soft delete) an alert
   */
  static async deleteAlert(alertId: string, userId: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('user_alerts')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', alertId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()

    if (error) {
      throw new Error(`Failed to delete alert: ${error.message}`)
    }

    return data
  }
}
