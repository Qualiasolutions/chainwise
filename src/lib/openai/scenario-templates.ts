// Specialized Crypto Scenario Prompt Templates
// Optimized using Lyra methodology for maximum effectiveness

export interface ScenarioTemplate {
  id: string
  name: string
  category: 'market-analysis' | 'trading' | 'education' | 'portfolio' | 'news-reaction'
  personas: ('buddy' | 'professor' | 'trader')[]
  contextPrompt: string
  expectedOutputFormat: string
}

export const CRYPTO_SCENARIOS: Record<string, ScenarioTemplate> = {
  // Market Analysis Scenarios
  btc_price_prediction: {
    id: 'btc_price_prediction',
    name: 'Bitcoin Price Analysis',
    category: 'market-analysis',
    personas: ['buddy', 'professor', 'trader'],
    contextPrompt: `User is asking about Bitcoin's price direction. Use LIVE market data to provide:
- Current BTC price and 24h movement from your data feed
- Key technical levels (support/resistance) from live charts
- Market sentiment indicators from your context
- Correlation with macro factors (DXY, stocks) if available`,
    expectedOutputFormat: 'Price analysis with specific levels and actionable guidance'
  },

  altcoin_opportunity: {
    id: 'altcoin_opportunity',
    name: 'Altcoin Investment Opportunity',
    category: 'trading',
    personas: ['professor', 'trader'],
    contextPrompt: `User is asking about altcoin opportunities. Focus on:
- Current altcoin performance vs BTC/ETH from live data
- Sector rotation signals and narrative trends
- Volume and momentum indicators from your data
- Risk-adjusted opportunity assessment`,
    expectedOutputFormat: 'Specific altcoin recommendations with entry criteria and risk management'
  },

  market_crash_response: {
    id: 'market_crash_response',
    name: 'Market Crash Response',
    category: 'education',
    personas: ['buddy', 'professor'],
    contextPrompt: `Market is experiencing significant downside movement. User needs guidance on:
- Current market conditions and volatility levels from live data
- Historical context for similar market events
- Risk management and portfolio protection strategies
- Psychological support and decision-making framework`,
    expectedOutputFormat: 'Calm, educational response with actionable protective measures'
  },

  defi_yield_analysis: {
    id: 'defi_yield_analysis',
    name: 'DeFi Yield Strategy',
    category: 'portfolio',
    personas: ['professor', 'trader'],
    contextPrompt: `User is asking about DeFi yield opportunities. Address:
- Current yield rates across major protocols from live data
- Risk assessment for different DeFi strategies
- Gas costs and efficiency considerations from network data
- Portfolio allocation recommendations for DeFi exposure`,
    expectedOutputFormat: 'Structured DeFi strategy with specific protocols and risk warnings'
  },

  news_reaction_analysis: {
    id: 'news_reaction_analysis',
    name: 'Breaking News Impact',
    category: 'news-reaction',
    personas: ['professor', 'trader'],
    contextPrompt: `Breaking crypto news has just occurred. User wants to understand impact:
- Immediate market reaction from live price data
- Historical precedent for similar news events
- Short-term and long-term market implications
- Trading opportunities and risks from this development`,
    expectedOutputFormat: 'Rapid news analysis with market impact assessment and action items'
  },

  portfolio_rebalancing: {
    id: 'portfolio_rebalancing',
    name: 'Portfolio Rebalancing',
    category: 'portfolio',
    personas: ['buddy', 'professor'],
    contextPrompt: `User needs portfolio rebalancing advice. Consider:
- Current portfolio allocation vs target weights
- Market conditions and asset performance from live data
- Rebalancing frequency and tax implications
- Risk tolerance and investment timeline adjustments`,
    expectedOutputFormat: 'Step-by-step rebalancing plan with specific allocation targets'
  },

  bear_market_strategy: {
    id: 'bear_market_strategy',
    name: 'Bear Market Navigation',
    category: 'education',
    personas: ['buddy', 'professor'],
    contextPrompt: `Market is in sustained downtrend. User needs bear market guidance:
- Current market phase identification from trend data
- Historical bear market patterns and duration
- Accumulation strategies and dollar-cost averaging
- Psychological resilience and long-term perspective`,
    expectedOutputFormat: 'Comprehensive bear market survival guide with actionable steps'
  },

  bull_market_optimization: {
    id: 'bull_market_optimization',
    name: 'Bull Market Profit-Taking',
    category: 'trading',
    personas: ['professor', 'trader'],
    contextPrompt: `Market is in strong uptrend. User needs bull market strategy:
- Current momentum and euphoria indicators from market data
- Profit-taking strategies and target levels
- Risk management during exuberant phases
- Portfolio optimization for continued upside with downside protection`,
    expectedOutputFormat: 'Bull market strategy with specific profit-taking levels and risk controls'
  },

  regulatory_impact: {
    id: 'regulatory_impact',
    name: 'Regulatory News Analysis',
    category: 'news-reaction',
    personas: ['professor'],
    contextPrompt: `New regulatory developments affecting crypto. User needs analysis:
- Immediate market reaction to regulatory news from price data
- Long-term implications for crypto adoption and infrastructure
- Geographic impact and jurisdiction-specific effects
- Portfolio positioning recommendations given regulatory changes`,
    expectedOutputFormat: 'Educational analysis of regulatory impact with strategic positioning advice'
  },

  technical_breakdown: {
    id: 'technical_breakdown',
    name: 'Technical Analysis Deep Dive',
    category: 'trading',
    personas: ['professor', 'trader'],
    contextPrompt: `User wants detailed technical analysis. Provide:
- Current chart patterns and trend analysis from live data
- Key technical indicators (RSI, MACD, moving averages) readings
- Support and resistance levels with confluence zones
- Volume analysis and momentum confirmation signals`,
    expectedOutputFormat: 'Comprehensive technical analysis with specific trading levels and signals'
  }
}

// Dynamic scenario matching based on user input
export class ScenarioMatcher {
  static identifyScenario(userMessage: string, currentMarketConditions: any): ScenarioTemplate | null {
    const message = userMessage.toLowerCase()

    // Price prediction scenarios
    if (message.includes('price') && (message.includes('bitcoin') || message.includes('btc'))) {
      return CRYPTO_SCENARIOS.btc_price_prediction
    }

    // Altcoin opportunities
    if (message.includes('altcoin') || message.includes('alt') && message.includes('opportunity')) {
      return CRYPTO_SCENARIOS.altcoin_opportunity
    }

    // Market crash scenarios
    if (currentMarketConditions?.marketSentiment?.trendingSentiment === 'bearish' &&
        (message.includes('crash') || message.includes('dump') || message.includes('falling'))) {
      return CRYPTO_SCENARIOS.market_crash_response
    }

    // DeFi scenarios
    if (message.includes('defi') || message.includes('yield') || message.includes('staking')) {
      return CRYPTO_SCENARIOS.defi_yield_analysis
    }

    // Portfolio scenarios
    if (message.includes('portfolio') || message.includes('allocation') || message.includes('rebalance')) {
      return CRYPTO_SCENARIOS.portfolio_rebalancing
    }

    // Technical analysis
    if (message.includes('technical') || message.includes('chart') || message.includes('rsi') || message.includes('support')) {
      return CRYPTO_SCENARIOS.technical_breakdown
    }

    // Bull market scenarios
    if (currentMarketConditions?.marketSentiment?.trendingSentiment === 'bullish' &&
        (message.includes('bull') || message.includes('moon') || message.includes('profit'))) {
      return CRYPTO_SCENARIOS.bull_market_optimization
    }

    // Bear market scenarios
    if (currentMarketConditions?.marketSentiment?.trendingSentiment === 'bearish' &&
        (message.includes('bear') || message.includes('dca') || message.includes('accumulate'))) {
      return CRYPTO_SCENARIOS.bear_market_strategy
    }

    return null
  }

  static enhancePromptWithScenario(
    basePrompt: string,
    scenario: ScenarioTemplate,
    persona: 'buddy' | 'professor' | 'trader',
    marketData: any
  ): string {
    if (!scenario.personas.includes(persona)) {
      return basePrompt
    }

    const scenarioContext = `

**SCENARIO CONTEXT: ${scenario.name.toUpperCase()}**
${scenario.contextPrompt}

**EXPECTED OUTPUT**: ${scenario.expectedOutputFormat}

**LIVE MARKET DATA FOR SCENARIO**: Use the following real-time data to inform your scenario-specific response:
${JSON.stringify(marketData, null, 2)}
`

    return basePrompt + scenarioContext
  }
}

// Persona-specific scenario preferences
export const PERSONA_SCENARIO_PREFERENCES = {
  buddy: {
    preferredCategories: ['education', 'portfolio', 'market-analysis'],
    avoidCategories: ['trading'],
    responseStyle: 'Simple explanations with encouragement and basic action steps'
  },
  professor: {
    preferredCategories: ['education', 'market-analysis', 'news-reaction', 'portfolio'],
    avoidCategories: [],
    responseStyle: 'Educational depth with structured analysis and learning objectives'
  },
  trader: {
    preferredCategories: ['trading', 'market-analysis', 'news-reaction'],
    avoidCategories: ['education'],
    responseStyle: 'Rapid execution focus with specific levels and timing'
  }
} as const