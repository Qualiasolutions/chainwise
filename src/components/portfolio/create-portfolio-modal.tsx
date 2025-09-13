'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface CreatePortfolioModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: {
    name: string
    description?: string
    isDefault?: boolean
  }) => Promise<void>
}

export default function CreatePortfolioModal({ 
  open, 
  onClose, 
  onCreate 
}: CreatePortfolioModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return

    try {
      setCreating(true)
      
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        isDefault
      })

      // Reset form
      setName('')
      setDescription('')
      setIsDefault(false)
      onClose()
    } catch (error) {
      console.error('Error creating portfolio:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    if (!creating) {
      setName('')
      setDescription('')
      setIsDefault(false)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
          <DialogDescription>
            Create a new portfolio to organize your crypto investments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Portfolio Name */}
          <div>
            <Label htmlFor="portfolio-name">Portfolio Name*</Label>
            <Input
              id="portfolio-name"
              placeholder="My Crypto Portfolio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              disabled={creating}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="portfolio-description">Description (Optional)</Label>
            <Textarea
              id="portfolio-description"
              placeholder="Describe this portfolio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
              disabled={creating}
            />
          </div>

          {/* Default Portfolio */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-default"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(!!checked)}
              disabled={creating}
            />
            <Label htmlFor="is-default" className="text-sm">
              Set as default portfolio
            </Label>
          </div>

          {/* Portfolio Templates */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Quick Start Templates
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setName('DeFi Portfolio')
                  setDescription('Decentralized Finance tokens and protocols')
                }}
                disabled={creating}
                className="w-full text-left p-2 rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <span className="font-medium">DeFi Portfolio</span>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  For DeFi tokens and protocols
                </p>
              </button>
              
              <button
                onClick={() => {
                  setName('Blue Chip Portfolio')
                  setDescription('Major cryptocurrencies like BTC, ETH, and top altcoins')
                }}
                disabled={creating}
                className="w-full text-left p-2 rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <span className="font-medium">Blue Chip Portfolio</span>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Major cryptocurrencies and top altcoins
                </p>
              </button>

              <button
                onClick={() => {
                  setName('High Risk Portfolio')
                  setDescription('Small cap altcoins and experimental tokens')
                }}
                disabled={creating}
                className="w-full text-left p-2 rounded bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <span className="font-medium">High Risk Portfolio</span>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Small cap and experimental tokens
                </p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={creating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="flex-1"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Portfolio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}