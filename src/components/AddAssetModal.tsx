"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  TrendingUp,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Hash,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { toast } from "sonner"

interface CryptoSearchResult {
  id: string
  symbol: string
  name: string
  image: string
  market_cap_rank: number
}

interface AddAssetModalProps {
  portfolioId: string
  onAssetAdded?: (holdingData?: any) => void
  children?: React.ReactNode
}

export function AddAssetModal({ portfolioId, onAssetAdded, children }: AddAssetModalProps) {
  const { profile } = useSupabaseAuth()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CryptoSearchResult[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [addingAsset, setAddingAsset] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Form state
  const [amount, setAmount] = useState("")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])

  // Debounced search
  const searchCryptos = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    setSearchError(null)

    try {
      const response = await fetch(`/api/crypto/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResults(data.results || [])
    } catch (error: any) {
      console.error('Search error:', error)
      setSearchError(error.message)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCryptos(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchCryptos])

  const handleSelectCrypto = (crypto: CryptoSearchResult) => {
    setSelectedCrypto(crypto)
    setSearchQuery("")
    setSearchResults([])
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!selectedCrypto) {
      errors.push("Please select a cryptocurrency")
    }

    if (!amount || parseFloat(amount) <= 0) {
      errors.push("Amount must be greater than 0")
    }

    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      errors.push("Purchase price must be greater than 0")
    }

    if (!purchaseDate) {
      errors.push("Purchase date is required")
    }

    return errors
  }

  const handleAddAsset = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    setAddingAsset(true)

    const holdingData = {
      symbol: selectedCrypto!.symbol,
      name: selectedCrypto!.name,
      amount: parseFloat(amount),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: new Date(purchaseDate).toISOString(),
      coinGeckoId: selectedCrypto!.id
    }

    try {
      // Trigger optimistic update immediately
      if (onAssetAdded) {
        onAssetAdded(holdingData)
      }

      // Reset form and close modal immediately for better UX
      setSelectedCrypto(null)
      setAmount("")
      setPurchasePrice("")
      setPurchaseDate(new Date().toISOString().split('T')[0])
      setOpen(false)

      // Make API call in background
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(holdingData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add asset')
      }

      // Success is already shown by the optimistic update

    } catch (error: any) {
      console.error('Add asset error:', error)
      toast.error(error.message)
      // The portfolio page will handle reverting the optimistic update
    } finally {
      setAddingAsset(false)
    }
  }

  const resetForm = () => {
    setSelectedCrypto(null)
    setSearchQuery("")
    setSearchResults([])
    setAmount("")
    setPurchasePrice("")
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setSearchError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button className="purple-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Crypto Asset</DialogTitle>
          <DialogDescription>
            Add a cryptocurrency to your portfolio to track its performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crypto Selection */}
          {!selectedCrypto ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Cryptocurrency</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search Bitcoin, Ethereum, etc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchError && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-950 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {searchError}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Search Results</Label>
                  <ScrollArea className="h-64 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {searchResults.map((crypto) => (
                        <button
                          key={crypto.id}
                          onClick={() => handleSelectCrypto(crypto)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                        >
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/crypto-fallback.png"
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{crypto.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {crypto.symbol}
                              </Badge>
                            </div>
                            {crypto.market_cap_rank && (
                              <div className="text-xs text-muted-foreground">
                                Rank #{crypto.market_cap_rank}
                              </div>
                            )}
                          </div>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && !searchError && (
                <div className="text-center text-muted-foreground py-8">
                  No cryptocurrencies found for "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Crypto Display */}
              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                <img
                  src={selectedCrypto.image}
                  alt={selectedCrypto.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedCrypto.name}</span>
                    <Badge variant="outline">{selectedCrypto.symbol}</Badge>
                  </div>
                  {selectedCrypto.market_cap_rank && (
                    <div className="text-sm text-muted-foreground">
                      Market Cap Rank #{selectedCrypto.market_cap_rank}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCrypto(null)}
                >
                  Change
                </Button>
              </div>

              <Separator />

              {/* Holdings Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Amount
                    </div>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Purchase Price
                    </div>
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchaseDate">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Purchase Date
                  </div>
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>

              {/* Holdings Limit Warning */}
              {profile?.tier === 'free' && (
                <div className="flex items-start gap-2 p-3 text-sm text-amber-700 bg-amber-50 rounded-lg dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Free Tier Limit</div>
                    <div>You can add up to 3 holdings. Upgrade to PRO for up to 20 holdings.</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedCrypto(null)}
                  disabled={addingAsset}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 purple-gradient"
                  onClick={handleAddAsset}
                  disabled={addingAsset}
                >
                  {addingAsset ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Add to Portfolio
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}