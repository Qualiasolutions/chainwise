'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { AlertFormData } from '@/types/alerts'

const alertSchema = z.object({
  cryptoId: z.string().min(1, 'Please select a cryptocurrency'),
  symbol: z.string().min(1, 'Symbol is required'),
  alertType: z.enum(['price_above', 'price_below']), // Only support price alerts for now
  targetValue: z.number().positive('Target value must be positive'),
  message: z.string().optional(),
  isActive: z.boolean()
})

interface AlertFormProps {
  onSuccess: () => void
  onCancel: () => void
  initialData?: Partial<AlertFormData>
  isEditing?: boolean
  alertId?: string
}

interface CryptoOption {
  id: string
  symbol: string
  name: string
  current_price: number
  image: string
}

export default function AlertForm({
  onSuccess,
  onCancel,
  initialData,
  isEditing = false,
  alertId
}: AlertFormProps) {
  const [loading, setLoading] = useState(false)
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      cryptoId: initialData?.cryptoId || '',
      symbol: initialData?.symbol || '',
      alertType: initialData?.alertType || 'price_above',
      targetValue: initialData?.targetValue || 0,
      message: initialData?.message || '',
      isActive: initialData?.isActive ?? true
    }
  })

  const alertType = watch('alertType')
  const targetValue = watch('targetValue')

  // Load crypto options
  useEffect(() => {
    loadCryptoOptions()
  }, [])

  const loadCryptoOptions = async () => {
    try {
      const response = await fetch('/api/crypto/list?limit=100')
      if (!response.ok) {
        throw new Error('Failed to load cryptocurrencies')
      }
      const data = await response.json()
      setCryptoOptions(data.cryptos || [])
    } catch (error) {
      console.error('Error loading crypto options:', error)
      setError('Failed to load cryptocurrency options')
    }
  }

  const onSubmit = async (data: AlertFormData) => {
    setLoading(true)
    setError(null)

    try {
      const url = isEditing ? '/api/alerts' : '/api/alerts'
      const method = isEditing ? 'PUT' : 'POST'

      // Map form data to API expected format
      const payload: any = {
        cryptoId: data.cryptoId,
        cryptoSymbol: data.symbol,
        targetPrice: data.targetValue,
        condition: data.alertType === 'price_above' ? 'above' : 'below',
        message: data.message
      }

      // Add ID if editing
      if (isEditing && alertId) {
        payload.id = alertId
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save alert')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving alert:', error)
      setError(error instanceof Error ? error.message : 'Failed to save alert')
    } finally {
      setLoading(false)
    }
  }

  const handleCryptoSelect = (cryptoId: string) => {
    const crypto = cryptoOptions.find(c => c.id === cryptoId)
    if (crypto) {
      setSelectedCrypto(crypto)
      setValue('cryptoId', crypto.id)
      setValue('symbol', crypto.symbol.toUpperCase())

      // Set default target value to current price for price alerts
      if (alertType === 'price_above' || alertType === 'price_below') {
        setValue('targetValue', crypto.current_price)
      }
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_above':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'price_below':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'volume_spike':
        return <BarChart3 className="w-4 h-4 text-blue-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
    }
  }

  const getAlertTypeDescription = (type: string) => {
    switch (type) {
      case 'price_above':
        return 'Notify when price goes above target value'
      case 'price_below':
        return 'Notify when price goes below target value'
      case 'volume_spike':
        return 'Notify on unusual volume increases'
      case 'percentage_change':
        return 'Notify on percentage price changes'
      case 'market_cap_change':
        return 'Notify on market cap changes'
      default:
        return ''
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Alert' : 'Create New Alert'}</CardTitle>
        <CardDescription>
          Set up price alerts to stay informed about market movements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Cryptocurrency Selection */}
          <div className="space-y-2">
            <Label htmlFor="crypto">Cryptocurrency</Label>
            <Select onValueChange={handleCryptoSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {cryptoOptions.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.id}>
                    <div className="flex items-center space-x-2">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span>{crypto.name}</span>
                      <span className="text-gray-500">({crypto.symbol.toUpperCase()})</span>
                      <span className="text-green-600 ml-auto">
                        {formatCurrency(crypto.current_price)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCrypto && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current price: {formatCurrency(selectedCrypto.current_price)}
              </div>
            )}
            {errors.cryptoId && (
              <p className="text-sm text-red-500">{errors.cryptoId.message}</p>
            )}
          </div>

          {/* Alert Type */}
          <div className="space-y-2">
            <Label htmlFor="alertType">Alert Type</Label>
            <Select
              value={alertType}
              onValueChange={(value) => setValue('alertType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_above">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Price Above</span>
                  </div>
                </SelectItem>
                <SelectItem value="price_below">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span>Price Below</span>
                  </div>
                </SelectItem>
                <SelectItem value="volume_spike">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span>Volume Spike</span>
                  </div>
                </SelectItem>
                <SelectItem value="percentage_change">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Percentage Change</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getAlertTypeDescription(alertType)}
            </p>
            {errors.alertType && (
              <p className="text-sm text-red-500">{errors.alertType.message}</p>
            )}
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="targetValue">Target Value</Label>
            <Input
              id="targetValue"
              type="number"
              step="0.01"
              placeholder={
                alertType === 'price_above' || alertType === 'price_below'
                  ? 'Enter target price'
                  : alertType === 'percentage_change'
                  ? 'Enter percentage (e.g., 5 for 5%)'
                  : 'Enter target value'
              }
              {...register('targetValue', { valueAsNumber: true })}
            />
            {selectedCrypto && (alertType === 'price_above' || alertType === 'price_below') && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current: {formatCurrency(selectedCrypto.current_price)}
                {targetValue > 0 && (
                  <span className={`ml-2 ${
                    alertType === 'price_above'
                      ? targetValue > selectedCrypto.current_price ? 'text-green-600' : 'text-red-600'
                      : targetValue < selectedCrypto.current_price ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({targetValue > selectedCrypto.current_price ? '+' : ''}
                    {((targetValue - selectedCrypto.current_price) / selectedCrypto.current_price * 100).toFixed(2)}%)
                  </span>
                )}
              </p>
            )}
            {errors.targetValue && (
              <p className="text-sm text-red-500">{errors.targetValue.message}</p>
            )}
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a custom message for this alert..."
              {...register('message')}
              rows={3}
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This message will be included in the alert notification
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Alert' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
