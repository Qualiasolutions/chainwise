"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, Trash2, Check } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth"
import { toast } from "sonner"

interface Portfolio {
  id: string
  name: string
  description: string | null
  is_default: boolean
  created_at: string
}

interface PortfolioManagerProps {
  currentPortfolioId: string | null
  onPortfolioChange: (portfolioId: string) => void
}

export function PortfolioManager({ currentPortfolioId, onPortfolioChange }: PortfolioManagerProps) {
  const { profile } = useSupabaseAuth()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectDialogOpen, setSelectDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [portfolioToDelete, setPortfolioToDelete] = useState<string | null>(null)

  // Form state
  const [newPortfolioName, setNewPortfolioName] = useState("")
  const [newPortfolioDescription, setNewPortfolioDescription] = useState("")

  // Fetch portfolios
  const fetchPortfolios = async () => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPortfolios(data || [])
    } catch (error) {
      console.error('Error fetching portfolios:', error)
      toast.error('Failed to load portfolios')
    }
  }

  useEffect(() => {
    fetchPortfolios()
  }, [profile])

  // Create new portfolio
  const handleCreatePortfolio = async () => {
    if (!profile || !newPortfolioName.trim()) {
      toast.error('Portfolio name is required')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: profile.id,
          name: newPortfolioName.trim(),
          description: newPortfolioDescription.trim() || null,
          is_default: portfolios.length === 0 // First portfolio is default
        })
        .select()
        .single()

      if (error) throw error

      toast.success(`Portfolio "${newPortfolioName}" created successfully!`)
      setNewPortfolioName("")
      setNewPortfolioDescription("")
      setCreateDialogOpen(false)
      await fetchPortfolios()

      // Switch to new portfolio
      if (data) {
        onPortfolioChange(data.id)
      }
    } catch (error: any) {
      console.error('Error creating portfolio:', error)
      toast.error(error.message || 'Failed to create portfolio')
    } finally {
      setLoading(false)
    }
  }

  // Switch portfolio
  const handleSwitchPortfolio = (portfolioId: string) => {
    onPortfolioChange(portfolioId)
    setSelectDialogOpen(false)

    const portfolio = portfolios.find(p => p.id === portfolioId)
    if (portfolio) {
      toast.success(`Switched to "${portfolio.name}"`)
    }
  }

  // Delete portfolio
  const handleDeletePortfolio = async () => {
    if (!portfolioToDelete) return

    const portfolio = portfolios.find(p => p.id === portfolioToDelete)
    if (portfolio?.is_default && portfolios.length > 1) {
      toast.error('Cannot delete default portfolio. Set another portfolio as default first.')
      setDeleteDialogOpen(false)
      setPortfolioToDelete(null)
      return
    }

    setLoading(true)
    try {
      // Delete all holdings first
      const { error: holdingsError } = await supabase
        .from('portfolio_holdings')
        .delete()
        .eq('portfolio_id', portfolioToDelete)

      if (holdingsError) throw holdingsError

      // Delete portfolio
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioToDelete)

      if (error) throw error

      toast.success(`Portfolio "${portfolio?.name}" deleted successfully`)
      setDeleteDialogOpen(false)
      setPortfolioToDelete(null)
      await fetchPortfolios()

      // If deleted current portfolio, switch to another
      if (portfolioToDelete === currentPortfolioId) {
        const remaining = portfolios.filter(p => p.id !== portfolioToDelete)
        if (remaining.length > 0) {
          onPortfolioChange(remaining[0].id)
        }
      }
    } catch (error: any) {
      console.error('Error deleting portfolio:', error)
      toast.error(error.message || 'Failed to delete portfolio')
    } finally {
      setLoading(false)
    }
  }

  const currentPortfolio = portfolios.find(p => p.id === currentPortfolioId)

  return (
    <div className="flex items-center gap-2">
      {/* Portfolio Selector */}
      <Dialog open={selectDialogOpen} onOpenChange={setSelectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            {currentPortfolio?.name || 'Select Portfolio'}
            {portfolios.length > 1 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {portfolios.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Portfolios</DialogTitle>
            <DialogDescription>
              Switch between your portfolios or manage them
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleSwitchPortfolio(portfolio.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{portfolio.name}</span>
                    {portfolio.is_default && (
                      <Badge variant="default" className="text-xs">Default</Badge>
                    )}
                    {portfolio.id === currentPortfolioId && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {portfolio.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {portfolio.description}
                    </p>
                  )}
                </div>

                {!portfolio.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPortfolioToDelete(portfolio.id)
                      setDeleteDialogOpen(true)
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Portfolio Button */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Portfolio
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
            <DialogDescription>
              Add a new portfolio to organize your crypto investments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="portfolio-name">Portfolio Name *</Label>
              <Input
                id="portfolio-name"
                placeholder="e.g., Long-term Holdings"
                value={newPortfolioName}
                onChange={(e) => setNewPortfolioName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="portfolio-description">Description (Optional)</Label>
              <Textarea
                id="portfolio-description"
                placeholder="Add a description for this portfolio..."
                value={newPortfolioDescription}
                onChange={(e) => setNewPortfolioDescription(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false)
                setNewPortfolioName("")
                setNewPortfolioDescription("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePortfolio}
              disabled={loading || !newPortfolioName.trim()}
            >
              {loading ? 'Creating...' : 'Create Portfolio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{portfolios.find(p => p.id === portfolioToDelete)?.name}"
              and all its holdings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPortfolioToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePortfolio}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Portfolio'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
