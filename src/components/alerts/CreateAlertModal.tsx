'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Percent } from "lucide-react"
import { toast } from "sonner"

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultSymbol?: string
  currentPrice?: number
}

interface NewAlert {
  symbol: string
  alertType: 'price_above' | 'price_below' | 'percentage_change'
  targetValue: string
}

export default function CreateAlertModal({
  isOpen,
  onClose,
  onSuccess,
  defaultSymbol = '',
  currentPrice
}: CreateAlertModalProps) {
  const [newAlert, setNewAlert] = useState<NewAlert>({
    symbol: defaultSymbol,
    alertType: '' as any,
    targetValue: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  React.useEffect(() => {
    if (isOpen && defaultSymbol) {
      setNewAlert(prev => ({ ...prev, symbol: defaultSymbol }))
    }
  }, [isOpen, defaultSymbol])

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.alertType || !newAlert.targetValue) {
      toast.error('Please fill in all fields')
      return
    }

    const targetValue = parseFloat(newAlert.targetValue)
    if (isNaN(targetValue) || targetValue <= 0) {
      toast.error('Please enter a valid target value')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newAlert.symbol.toLowerCase(),
          alertType: newAlert.alertType,
          targetValue: targetValue
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Price alert created successfully!')
        handleClose()
        onSuccess?.()
      } else {
        toast.error(data.error || 'Failed to create alert')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create alert')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNewAlert({ symbol: defaultSymbol, alertType: '' as any, targetValue: '' })
    onClose()
  }

  const handleAlertTypeChange = (alertType: string) => {
    setNewAlert(prev => ({ ...prev, alertType: alertType as any }))

    // Auto-populate target value based on current price and alert type
    if (currentPrice && alertType !== 'percentage_change') {
      const suggestedValue = alertType === 'price_above'
        ? Math.round(currentPrice * 1.1) // 10% above current price
        : Math.round(currentPrice * 0.9) // 10% below current price
      setNewAlert(prev => ({ ...prev, targetValue: suggestedValue.toString() }))
    } else if (alertType === 'percentage_change') {
      setNewAlert(prev => ({ ...prev, targetValue: '10' })) // Default 10% change
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Set up a new alert to monitor cryptocurrency prices and get notified when your conditions are met.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Cryptocurrency Symbol *</Label>
            <Input
              id="symbol"
              placeholder="e.g., BTC, ETH, XRP"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alertType">Alert Type *</Label>
            <Select
              value={newAlert.alertType}
              onValueChange={handleAlertTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_above">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">Price Above</div>
                      <div className="text-xs text-muted-foreground">Alert when price goes above target</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="price_below">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="font-medium">Price Below</div>
                      <div className="text-xs text-muted-foreground">Alert when price goes below target</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="percentage_change">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">Percentage Change</div>
                      <div className="text-xs text-muted-foreground">Alert on 24h percentage change</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetValue">
              Target Value *
              {newAlert.alertType === 'percentage_change' ? ' (%)' : ' ($)'}
            </Label>
            <Input
              id="targetValue"
              type="number"
              step="any"
              placeholder={newAlert.alertType === 'percentage_change' ? "e.g., 5" : "e.g., 50000"}
              value={newAlert.targetValue}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetValue: e.target.value }))}
            />
            {currentPrice && newAlert.alertType !== 'percentage_change' && (
              <p className="text-xs text-muted-foreground">
                Current price: ${currentPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={createAlert} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}