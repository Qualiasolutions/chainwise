'use client'

import { useState, useCallback } from 'react'
import { Search, X, Calculator, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { CryptoService } from '@/lib/crypto-service'
import { CryptoData } from '@/types'
// Simple debounce utility
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeoutId: NodeJS.Timeout | undefined
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

interface AddHoldingModalProps {
  open: boolean
  onClose: () => void
  onAdd: (holding: {
    cryptoId: string
    symbol: string
    name: string
    amount: number
    averagePurchasePriceUsd: number
    firstPurchaseDate?: string
  }) => Promise<void>
  portfolioId: string
}

export default function AddHoldingModal({ 
  open, 
  onClose, 
  onAdd, 
  portfolioId 
}: AddHoldingModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<CryptoData[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null)
  const [amount, setAmount] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([])
        return
      }

      setSearching(true)
      try {
        const results = await CryptoService.searchCrypto(term)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching crypto:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300),
    []
  )

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const handleCryptoSelect = (crypto: CryptoData) => {
    setSelectedCrypto(crypto)
    setPurchasePrice(crypto.current_price.toString())
    setSearchTerm('')
    setSearchResults([])
  }

  const handleAddHolding = async () => {
    if (!selectedCrypto || !amount || !purchasePrice) return

    try {
      setAdding(true)
      
      await onAdd({
        cryptoId: selectedCrypto.id,
        symbol: selectedCrypto.symbol.toUpperCase(),
        name: selectedCrypto.name,
        amount: parseFloat(amount),
        averagePurchasePriceUsd: parseFloat(purchasePrice),
        firstPurchaseDate: purchaseDate
      })

      // Reset form
      handleClose()
    } catch (error) {
      console.error('Error adding holding:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => {
    setSelectedCrypto(null)
    setAmount('')
    setPurchasePrice('')
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setSearchTerm('')
    setSearchResults([])
    onClose()
  }

  const totalCost = amount && purchasePrice 
    ? parseFloat(amount) * parseFloat(purchasePrice)
    : 0

  const currentValue = amount && selectedCrypto
    ? parseFloat(amount) * selectedCrypto.current_price
    : 0

  const potentialPnL = currentValue - totalCost

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
          <DialogDescription>
            Add a new cryptocurrency to your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedCrypto ? (
            // Crypto Selection Step
            <div className="space-y-4">
              <div>
                <Label htmlFor="crypto-search">Search Cryptocurrency</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="crypto-search"
                    placeholder="Search Bitcoin, Ethereum..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {searching && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                  {searchResults.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => handleCryptoSelect(crypto)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={crypto.image}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {crypto.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                            {crypto.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(crypto.current_price)}
                        </p>
                        {crypto.price_change_percentage_24h !== undefined && (
                          <p className={`text-sm ${
                            crypto.price_change_percentage_24h >= 0 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                            {crypto.price_change_percentage_24h.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && !searching && searchResults.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No results found for &quot;{searchTerm}&quot;
                </p>
              )}
            </div>
          ) : (
            // Holding Details Step
            <div className="space-y-4">
              {/* Selected Crypto */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img
                  src={selectedCrypto.image}
                  alt={selectedCrypto.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedCrypto.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current: {formatCurrency(selectedCrypto.current_price)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCrypto(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <Label htmlFor="purchase-price">
                  Purchase Price (per {selectedCrypto.symbol.toUpperCase()})
                </Label>
                <Input
                  id="purchase-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <Label htmlFor="purchase-date">Purchase Date</Label>
                <Input
                  id="purchase-date"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Investment Summary */}
              {amount && purchasePrice && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
                    <Calculator className="w-4 h-4" />
                    <span className="font-semibold">Investment Summary</span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-semibold">{formatCurrency(totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Value:</span>
                      <span className="font-semibold">{formatCurrency(currentValue)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-blue-200 dark:border-blue-800">
                      <span>Unrealized P&L:</span>
                      <span className={`font-semibold ${
                        potentialPnL >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {potentialPnL >= 0 ? '+' : ''}{formatCurrency(potentialPnL)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCrypto(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAddHolding}
                  disabled={!amount || !purchasePrice || adding}
                  className="flex-1"
                >
                  {adding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Holding
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}