'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import PortfolioDashboard from '@/components/portfolio/portfolio-dashboard'
import AddHoldingModal from '@/components/portfolio/add-holding-modal'
import CreatePortfolioModal from '@/components/portfolio/create-portfolio-modal'
import { toast } from 'sonner'

export default function PortfolioPage() {
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAddHoldingModal, setShowAddHoldingModal] = useState(false)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('')

  const handleCreatePortfolio = async (data: {
    name: string
    description?: string
    isDefault?: boolean
  }) => {
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create portfolio')
      }
      
      toast.success('Portfolio created successfully!')
      // The dashboard will refresh automatically
      
    } catch (error) {
      console.error('Error creating portfolio:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create portfolio')
      throw error // Re-throw to keep modal open
    }
  }

  const handleAddHolding = async (holding: {
    cryptoId: string
    symbol: string
    name: string
    amount: number
    averagePurchasePriceUsd: number
    firstPurchaseDate?: string
  }) => {
    if (!selectedPortfolioId) {
      throw new Error('No portfolio selected')
    }

    try {
      const response = await fetch(`/api/portfolio/${selectedPortfolioId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holding)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add holding')
      }
      
      toast.success('Holding added successfully!')
      // The dashboard will refresh automatically
      
    } catch (error) {
      console.error('Error adding holding:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add holding')
      throw error // Re-throw to keep modal open
    }
  }

  const handleShowAddHolding = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId)
    setShowAddHoldingModal(true)
  }

  const handleEditHolding = (holding: any) => {
    // TODO: Implement edit holding modal
    toast.info('Edit holding functionality coming soon!')
  }

  const handleDeleteHolding = async (holdingId: string) => {
    try {
      // TODO: Implement delete holding API call
      toast.info('Delete holding functionality coming soon!')
    } catch (error) {
      console.error('Error deleting holding:', error)
      toast.error('Failed to delete holding')
    }
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen chainwise-gradient">
        <div className="container mx-auto px-4 py-8">
          <PortfolioDashboard
            onCreatePortfolio={() => setShowCreateModal(true)}
            onAddHolding={handleShowAddHolding}
            onEditHolding={handleEditHolding}
            onDeleteHolding={handleDeleteHolding}
          />

          {/* Create Portfolio Modal */}
          <CreatePortfolioModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreatePortfolio}
          />

          {/* Add Holding Modal */}
          <AddHoldingModal
            open={showAddHoldingModal}
            onClose={() => {
              setShowAddHoldingModal(false)
              setSelectedPortfolioId('')
            }}
            onAdd={handleAddHolding}
            portfolioId={selectedPortfolioId}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}