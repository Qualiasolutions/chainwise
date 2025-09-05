export type AlertType = 'price_above' | 'price_below' | 'volume_spike' | 'percentage_change' | 'market_cap_change'

export interface Alert {
  id: string
  cryptoId: string
  symbol: string
  alertType: AlertType
  targetValue: number
  message?: string
  isActive: boolean
  lastTriggered?: string
  createdAt: string
  updatedAt: string
}

export interface AlertFormData {
  cryptoId: string
  symbol: string
  alertType: AlertType
  targetValue: number
  message?: string
  isActive: boolean
}