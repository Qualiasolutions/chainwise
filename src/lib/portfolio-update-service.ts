import { createAdminClient } from '@/lib/supabase/server'
import { PortfolioService } from '@/lib/portfolio-service'
import { CryptoService } from '@/lib/crypto-service'

export class PortfolioUpdateService {
  /**
   * Update all portfolios in the system with latest prices
   */
  static async updateAllPortfolios(): Promise<{ 
    success: number; 
    failed: number; 
    errors: string[] 
  }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }

    try {
      // Get all portfolios with holdings
      const supabase = createAdminClient()
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_holdings (*)
        `)
        .is('deleted_at', null)
      
      if (error) {
        throw new Error(`Failed to fetch portfolios: ${error.message}`)
      }

      console.log(`Found ${portfolios?.length || 0} portfolios to update`)

      for (const portfolio of portfolios || []) {
        try {
          await PortfolioService.updatePortfolioValues(portfolio.id)
          results.success++
          console.log(`Updated portfolio ${portfolio.id} successfully`)
        } catch (error) {
          results.failed++
          const errorMsg = `Failed to update portfolio ${portfolio.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          results.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

    } catch (error) {
      const errorMsg = `Failed to fetch portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMsg)
      console.error(errorMsg)
    }

    return results
  }

  /**
   * Update specific user's portfolios
   */
  static async updateUserPortfolios(userId: string): Promise<{
    success: number;
    failed: number;
    errors: string[]
  }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }

    try {
      const supabase = createAdminClient()
      const { data: portfolios, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_holdings (*)
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
      
      if (error) {
        throw new Error(`Failed to fetch user portfolios: ${error.message}`)
      }

      for (const portfolio of portfolios || []) {
        try {
          await PortfolioService.updatePortfolioValues(portfolio.id)
          results.success++
        } catch (error) {
          results.failed++
          const errorMsg = `Failed to update portfolio ${portfolio.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          results.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

    } catch (error) {
      const errorMsg = `Failed to fetch user portfolios: ${error instanceof Error ? error.message : 'Unknown error'}`
      results.errors.push(errorMsg)
      console.error(errorMsg)
    }

    return results
  }

  /**
   * Batch update portfolio prices for efficiency
   * Simplified to use individual portfolio updates via PortfolioService
   */
  static async batchUpdatePortfolioPrices(): Promise<{
    updatedPortfolios: number;
    updatedHoldings: number;
    errors: string[]
  }> {
    console.log('Batch update using individual portfolio updates...')
    const allResults = await this.updateAllPortfolios()
    
    return {
      updatedPortfolios: allResults.success,
      updatedHoldings: 0, // Individual updates don't track holdings separately
      errors: allResults.errors
    }
  }

  /**
   * Health check for portfolio update system
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    details: {
      totalPortfolios: number;
      totalHoldings: number;
      oldestUpdate: Date | null;
      apiStatus: 'connected' | 'error';
    }
  }> {
    try {
      // Check database connectivity
      const supabase = createAdminClient()
      
      const [
        { count: portfolioCount },
        { count: holdingCount },
        { data: oldestHolding }
      ] = await Promise.all([
        supabase.from('portfolios').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('portfolio_holdings').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('portfolio_holdings').select('last_updated').is('deleted_at', null).order('last_updated', { ascending: true }).limit(1).single()
      ])

      // Test API connectivity
      let apiStatus: 'connected' | 'error' = 'connected'
      try {
        await CryptoService.getCurrentPrice('bitcoin')
      } catch {
        apiStatus = 'error'
      }

      const details = {
        totalPortfolios: portfolioCount || 0,
        totalHoldings: holdingCount || 0,
        oldestUpdate: oldestHolding?.last_updated ? new Date(oldestHolding.last_updated) : null,
        apiStatus
      }

      // Determine overall health
      let status: 'healthy' | 'warning' | 'error' = 'healthy'
      
      if (apiStatus === 'error') {
        status = 'error'
      } else if (oldestHolding?.last_updated && Date.now() - new Date(oldestHolding.last_updated).getTime() > 1000 * 60 * 60) {
        // Warning if oldest update is over 1 hour
        status = 'warning'
      }

      return { status, details }

    } catch (error) {
      return {
        status: 'error',
        details: {
          totalPortfolios: 0,
          totalHoldings: 0,
          oldestUpdate: null,
          apiStatus: 'error'
        }
      }
    }
  }
}