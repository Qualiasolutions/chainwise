import openai from './client';
import { AI_PERSONAS, PersonaId } from './personas';
import { Context7Service } from '../context7/service';
import { cryptoDataService } from '../crypto-data-service';
import { ScenarioMatcher, PERSONA_SCENARIO_PREFERENCES } from './scenario-templates';
import { PremiumToolsPromptService } from './premium-tools-prompts';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  persona: PersonaId;
  message: string;
  conversationHistory?: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIService {
  static async generateChatResponse(options: ChatOptions): Promise<string> {
    const { persona, message, conversationHistory = [], maxTokens = 500, temperature = 0.7 } = options;

    const personaConfig = AI_PERSONAS[persona];

    if (!personaConfig) {
      throw new Error(`Invalid persona: ${persona}`);
    }

    // Get contextual documentation for enhanced responses
    let contextualInfo = '';
    try {
      if (typeof window === 'undefined') {
        // Only attempt Context7 integration on server-side
        contextualInfo = await Context7Service.getContextualInfo(persona, message);
      }
    } catch (error) {
      console.warn('Context7 integration not available:', error);
    }

    // Get real-time market data for AI context
    let marketData = null;
    let marketDataContext = '';
    try {
      if (typeof window === 'undefined') {
        // Only fetch market data on server-side
        console.log('🔄 Fetching real-time crypto data for AI response...');
        marketData = await cryptoDataService.getCurrentMarketData();
        marketDataContext = `\n\n${cryptoDataService.formatMarketDataForAI(marketData, persona)}`;
        console.log('✅ Live market data injected into AI context');
      }
    } catch (error) {
      console.warn('Live market data not available:', error);
    }

    // Identify and enhance with scenario-specific prompts
    let enhancedSystemPrompt: string = personaConfig.systemPrompt;
    if (marketData) {
      const scenario = ScenarioMatcher.identifyScenario(message, marketData);
      if (scenario) {
        console.log(`🎯 Identified scenario: ${scenario.name} for persona: ${persona}`);
        enhancedSystemPrompt = ScenarioMatcher.enhancePromptWithScenario(
          personaConfig.systemPrompt,
          scenario,
          persona,
          marketData
        );
      }
    }

    // Build conversation messages with enhanced context and live market data
    const systemPromptWithContext = `${enhancedSystemPrompt}${contextualInfo}${marketDataContext}`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPromptWithContext
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured, using mock responses');
        return await this.getMockResponse(persona, message);
      }

      // Validate API key format (should start with 'sk-')
      if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.warn('Invalid OpenAI API key format, using mock responses');
        return await this.getMockResponse(persona, message);
      }

      console.log(`Making OpenAI API call for persona: ${persona}, model: ${personaConfig.model}`);
      console.log(`Message length: ${message.length}, max tokens: ${maxTokens}`);
      console.log(`Conversation history length: ${conversationHistory.length}`);

      const completion = await openai.chat.completions.create({
        model: personaConfig.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        console.warn('No response from OpenAI, falling back to mock response');
        return await this.getMockResponse(persona, message);
      }

      console.log(`OpenAI API response received, length: ${response.length}`);
      console.log(`Tokens used: ${completion.usage?.total_tokens || 'unknown'}`);

      return response.trim();
    } catch (error: any) {
      console.error('OpenAI API error:', error);

      // Handle specific error types
      if (error?.code === 'invalid_api_key' || error?.message?.includes('API key')) {
        console.warn('Invalid OpenAI API key, using mock responses');
        return await this.getMockResponse(persona, message);
      }

      if (error?.code === 'rate_limit_exceeded') {
        return this.getErrorResponse(persona, "I'm currently experiencing high demand. Please try again in a moment.");
      }

      if (error?.code === 'insufficient_quota') {
        return this.getErrorResponse(persona, "API quota exceeded. Please try again later or contact support.");
      }

      // For network or other errors, provide graceful fallback
      console.warn('OpenAI API unavailable, falling back to mock response');
      return await this.getMockResponse(persona, message);
    }
  }

  private static async getMockResponse(persona: PersonaId, userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // Try to get real-time data even for mock responses
    let marketData = null;
    try {
      if (typeof window === 'undefined') {
        marketData = await cryptoDataService.getCurrentMarketData();
      }
    } catch (error) {
      console.warn('Could not fetch live data for mock response:', error);
    }

    // Identify scenario for mock response enhancement
    const scenario = marketData ? ScenarioMatcher.identifyScenario(userMessage, marketData) : null;
    const personaPrefs = PERSONA_SCENARIO_PREFERENCES[persona];

    if (persona === 'buddy') {
      if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        if (marketData) {
          const btc = marketData.bitcoin;
          const change = btc.change24hPercent >= 0 ? `up ${btc.change24hPercent.toFixed(2)}%` : `down ${Math.abs(btc.change24hPercent).toFixed(2)}%`;
          return `Hey! Bitcoin is currently trading at $${btc.price.toLocaleString()}, ${change} today! ${btc.change24hPercent >= 0 ? 'Looking strong!' : 'A bit of a dip, but that could be a buying opportunity!'} Remember to only invest what you can afford to lose! 🚀`;
        }
        return "Hey! Bitcoin is looking pretty solid right now! It's the king of crypto for a reason. Always remember to do your own research and never invest more than you can afford to lose! 🚀";
      }
      if (lowerMessage.includes('price') || lowerMessage.includes('sell')) {
        if (marketData) {
          const sentiment = marketData.marketSentiment.trendingSentiment;
          return `Great question! The market is looking ${sentiment} today. With Bitcoin at $${marketData.bitcoin.price.toLocaleString()}, I'd consider your risk tolerance and investment timeline. ${sentiment === 'bullish' ? 'Could be a good entry point!' : sentiment === 'bearish' ? 'Maybe wait for more stability?' : 'Neutral times can be opportunities!'} What's your investment goal?`;
        }
        return "That's a great question! Market timing is tricky, but here's what I'd consider: your financial goals, risk tolerance, and overall portfolio balance. What matters most is having a plan that works for you!";
      }
      if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
        if (marketData) {
          const eth = marketData.ethereum;
          return `Ethereum is amazing! Currently at $${eth.price.toLocaleString()}, ${eth.change24hPercent >= 0 ? 'up' : 'down'} ${Math.abs(eth.change24hPercent).toFixed(2)}% today. Smart contracts, DeFi, NFTs - it's the Swiss Army knife of crypto! ${eth.change24hPercent >= 0 ? 'Looking good today!' : 'A dip might be a buying chance!'} What interests you most about ETH?`;
        }
        return "Ethereum is such a cool blockchain! Smart contracts, DeFi, NFTs - it's like the Swiss Army knife of crypto. The upgrade to Proof of Stake made it more eco-friendly too. What interests you most about ETH?";
      }
      return "Hey there! I'm here to help with all your crypto questions. What would you like to know about the crypto world today?";
    }

    if (persona === 'professor') {
      if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        if (marketData) {
          const btc = marketData.bitcoin;
          const dominance = marketData.marketSentiment.dominanceBTC;
          return `Bitcoin at $${btc.price.toLocaleString()} maintains ${dominance}% market dominance. Current analysis: ${btc.change24hPercent >= 0 ? 'bullish momentum with' : 'bearish pressure at'} ${Math.abs(btc.change24hPercent).toFixed(2)}% 24h change. Volume: $${(btc.volume / 1e9).toFixed(1)}B. Key factors: institutional adoption, regulatory clarity, and macroeconomic correlations.`;
        }
        return "Bitcoin remains the dominant cryptocurrency with a market cap representing digital gold status. Key analysis factors include: adoption metrics, regulatory landscape, institutional investment flows, and macroeconomic correlations with traditional assets.";
      }
      if (lowerMessage.includes('price') || lowerMessage.includes('sell')) {
        if (marketData) {
          return `Current market analysis: ${marketData.marketSentiment.trendingSentiment.toUpperCase()} sentiment. BTC: $${marketData.bitcoin.price.toLocaleString()}, ETH: $${marketData.ethereum.price.toLocaleString()}. Consider: fundamental analysis, technical patterns, and risk-reward ratios. Market cap: $${(marketData.marketSentiment.totalMarketCap / 1e12).toFixed(2)}T.`;
        }
        return "Investment decisions should incorporate fundamental analysis, technical indicators, and time horizon considerations. Evaluate market cycles, volume patterns, volatility metrics, and portfolio allocation percentages before executing trades.";
      }
      if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
        if (marketData) {
          const eth = marketData.ethereum;
          return `Ethereum at $${eth.price.toLocaleString()}, ${eth.change24hPercent >= 0 ? 'up' : 'down'} ${Math.abs(eth.change24hPercent).toFixed(2)}%. Post-PoS transition: 99.9% energy reduction maintained. Network TVL significant in DeFi. Volume: $${(eth.volume / 1e9).toFixed(1)}B. Layer 2 scaling solutions address throughput concerns effectively.`;
        }
        return "Ethereum's transition to Proof-of-Stake reduced energy consumption by 99.9% while maintaining security. The network hosts over 4,000 DApps with $50B+ TVL in DeFi protocols. Layer 2 solutions address scalability concerns.";
      }
      return "I'm here to provide educational insights about cryptocurrency markets and blockchain technology. What specific topic would you like to explore?";
    }

    if (persona === 'trader') {
      if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        if (marketData) {
          const btc = marketData.bitcoin;
          const ta = cryptoDataService.generateTechnicalAnalysis('BTC', btc.price, btc.change24hPercent, btc.high24h, btc.low24h);
          return `BTC: $${btc.price.toLocaleString()} | ${ta.recommendation.toUpperCase()} | Support: $${ta.support.toLocaleString()} | Resistance: $${ta.resistance.toLocaleString()} | R/R: ${ta.riskReward} | Trend: ${ta.trend.toUpperCase()}`;
        }
        return "BTC: Monitor $115K resistance, $108K support. RSI cooling from overbought. Volume analysis suggests consolidation. R/R 1:2.5 on breakout. Set stops at $105K. Watch DXY correlation.";
      }
      if (lowerMessage.includes('price') || lowerMessage.includes('sell')) {
        if (marketData) {
          const sentiment = marketData.marketSentiment.trendingSentiment.toUpperCase();
          return `Market: ${sentiment} | BTC: $${marketData.bitcoin.price.toLocaleString()} | ETH: $${marketData.ethereum.price.toLocaleString()} | Top mover: ${marketData.topMovers[0].symbol} ${marketData.topMovers[0].change24hPercent >= 0 ? '+' : ''}${marketData.topMovers[0].change24hPercent.toFixed(1)}% | Risk management critical.`;
        }
        return "Current market showing mixed signals. Consider 25% profit-taking on strength. Trail stops 8-12% below entry. Monitor momentum divergence on 4H charts. Risk management critical.";
      }
      if (lowerMessage.includes('ethereum') || lowerMessage.includes('eth')) {
        if (marketData) {
          const eth = marketData.ethereum;
          const ta = cryptoDataService.generateTechnicalAnalysis('ETH', eth.price, eth.change24hPercent, eth.high24h, eth.low24h);
          return `ETH: $${eth.price.toLocaleString()} | ${ta.recommendation.toUpperCase()} | Support: $${ta.support.toLocaleString()} | Target: $${ta.resistance.toLocaleString()} | R/R: ${ta.riskReward} | ${ta.trend.toUpperCase()}`;
        }
        return "ETH: Strong above $4.2K support. ETH/BTC ratio trending up. Options flow bullish. Target $4.8K, stop $4.0K. Monitor gas fees as sentiment indicator.";
      }
      return "Ready to analyze markets and provide trading insights. What's your current position or target asset?";
    }

    return "I'm here to help with your crypto questions. What would you like to know?";
  }

  private static getErrorResponse(persona: PersonaId, errorMessage: string): string {
    const responses = {
      buddy: `Hey! ${errorMessage} I'm still here to help though!`,
      professor: `I apologize, but ${errorMessage} Please try again shortly.`,
      trader: `Alert: ${errorMessage} Standby for market analysis.`
    };

    return responses[persona] || errorMessage;
  }

  static async generateReport(type: 'pro' | 'elite', content: string): Promise<string> {
    const systemPrompts = {
      pro: `You are creating a ChainWise Pro Weekly Report. Focus on practical insights for retail crypto investors:
- Top 3 coins performance and risk snapshot
- Market overview with main narratives
- Simple portfolio tips
- Alerts recap
Keep it digestible and actionable for Pro users.`,

      elite: `You are creating a ChainWise Elite Deep AI Report. Provide premium, VIP-level analysis:
- Full trend and narrative detection from social media
- Advanced technical and on-chain analysis
- Whale wallet movements and key highlights
- Stress-test scenarios and risk analysis
- Sentiment heatmap and market-wide signals
- Elite-only recommendations and under-the-radar opportunities
Make it feel exclusive and deeply insightful for Elite users.`
    };

    try {
      const completion = await openai.chat.completions.create({
        model: type === 'elite' ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompts[type]
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: type === 'elite' ? 1500 : 800,
        temperature: 0.6,
      });

      return completion.choices[0]?.message?.content || 'Report generation failed.';
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate report');
    }
  }

  static async analyzePortfolio(portfolioData: any): Promise<string> {
    const systemPrompt = `You are ChainWise's AI Portfolio Allocator. Analyze the user's crypto portfolio and provide:
- Clear percentage-based recommendations (buy/hold/sell)
- Reasoning based on current market conditions
- Risk assessment and diversification advice
- Specific actionable steps

Be professional and data-driven in your analysis.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze this portfolio: ${JSON.stringify(portfolioData)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content || 'Portfolio analysis failed.';
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw new Error('Failed to analyze portfolio');
    }
  }

  static async generateTradingSignal(marketData: any): Promise<string> {
    const systemPrompt = `You are ChainWise's professional trading signal generator. Create actionable trading signals with:
- Specific entry and exit points
- Risk-reward ratios
- Stop loss levels
- Market reasoning
- Time horizon

Format as professional trading advice.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate trading signal based on: ${JSON.stringify(marketData)}`
          }
        ],
        max_tokens: 600,
        temperature: 0.4,
      });

      return completion.choices[0]?.message?.content || 'Signal generation failed.';
    } catch (error) {
      console.error('Trading signal error:', error);
      throw new Error('Failed to generate trading signal');
    }
  }

  // Premium Tools Integration
  static async generatePremiumToolResponse(
    tool: string,
    userInput: any,
    userTier: string = 'free',
    maxTokens: number = 1000
  ): Promise<string> {
    try {
      // Get market data for context
      let marketData = null;
      try {
        if (typeof window === 'undefined') {
          marketData = await cryptoDataService.getCurrentMarketData();
        }
      } catch (error) {
        console.warn('Market data not available for premium tool analysis:', error);
      }

      // Generate optimized prompt using Lyra methodology
      const optimizedPrompt = await PremiumToolsPromptService.generateOptimizedPrompt(
        tool,
        userInput,
        marketData,
        userTier
      );

      console.log(`🚀 Generating premium tool response: ${tool} for ${userTier} tier user`);

      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
        console.warn('OpenAI API key not configured, using mock response for premium tool');
        return this.getMockPremiumToolResponse(tool, userInput, marketData);
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4', // Use GPT-4 for premium tools
        messages: [
          {
            role: 'system',
            content: optimizedPrompt
          },
          {
            role: 'user',
            content: `Analyze the provided data and generate a comprehensive ${tool} response according to the framework specified.`
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.5, // Lower temperature for more precise analysis
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        console.warn('No response from OpenAI for premium tool, falling back to mock response');
        return this.getMockPremiumToolResponse(tool, userInput, marketData);
      }

      console.log(`✅ Premium tool response generated successfully for ${tool}`);
      return response.trim();
    } catch (error: any) {
      console.error(`Premium tool ${tool} error:`, error);

      // Graceful fallback to mock response
      return this.getMockPremiumToolResponse(tool, userInput, null);
    }
  }

  private static getMockPremiumToolResponse(tool: string, userInput: any, marketData: any): string {
    const responses: Record<string, () => string> = {
      portfolio_allocator: () => {
        const { riskTolerance = 'moderate', totalAmount = 10000 } = userInput;
        if (marketData) {
          return `**PORTFOLIO ALLOCATION ANALYSIS**

**Market Context**: BTC at $${marketData.bitcoin?.price?.toLocaleString()}, ETH at $${marketData.ethereum?.price?.toLocaleString()}
**Risk Profile**: ${riskTolerance.toUpperCase()} (Score: ${riskTolerance === 'conservative' ? 3 : riskTolerance === 'aggressive' ? 8 : 6}/10)

**RECOMMENDED ALLOCATION**:
${riskTolerance === 'conservative' ?
  `- Bitcoin (BTC): 60% ($${(totalAmount * 0.6).toLocaleString()}) - Core stability
- Ethereum (ETH): 25% ($${(totalAmount * 0.25).toLocaleString()}) - Smart contract leader
- USDC: 15% ($${(totalAmount * 0.15).toLocaleString()}) - Stability buffer` :
  riskTolerance === 'aggressive' ?
  `- Bitcoin (BTC): 30% ($${(totalAmount * 0.3).toLocaleString()}) - Foundation
- Ethereum (ETH): 25% ($${(totalAmount * 0.25).toLocaleString()}) - DeFi exposure
- Solana (SOL): 20% ($${(totalAmount * 0.2).toLocaleString()}) - High growth
- Altcoin basket: 25% ($${(totalAmount * 0.25).toLocaleString()}) - Opportunity plays` :
  `- Bitcoin (BTC): 40% ($${(totalAmount * 0.4).toLocaleString()}) - Digital gold
- Ethereum (ETH): 30% ($${(totalAmount * 0.3).toLocaleString()}) - Platform leader
- Layer 1s: 20% ($${(totalAmount * 0.2).toLocaleString()}) - Diversification
- Stablecoins: 10% ($${(totalAmount * 0.1).toLocaleString()}) - Rebalancing power`}

**Risk Management**: Current market ${marketData.marketSentiment?.trendingSentiment} suggests ${marketData.marketSentiment?.trendingSentiment === 'bullish' ? 'gradual entry with DCA' : 'defensive positioning with higher cash allocation'}.`;
        }
        return `Portfolio allocation analysis completed for $${totalAmount} with ${riskTolerance} risk tolerance. Allocation optimized for current market conditions with proper diversification and risk management protocols.`;
      },

      whale_tracker: () => {
        if (marketData) {
          return `**WHALE INTELLIGENCE BRIEF**

**Market Impact Analysis**: Recent whale activity shows ${marketData.bitcoin?.change24hPercent >= 0 ? 'accumulation' : 'distribution'} patterns
**Key Movements**: Large BTC transactions increased 15% in 24h, ETH whale activity up 8%
**Exchange Flows**: Net ${marketData.bitcoin?.change24hPercent >= 0 ? 'outflow' : 'inflow'} detected from major exchanges
**Risk Assessment**: ${Math.abs(marketData.bitcoin?.change24hPercent) > 5 ? 'HIGH - Volatile whale activity' : 'MODERATE - Normal whale patterns'}

**Strategic Implications**: ${marketData.bitcoin?.change24hPercent >= 0 ? 'Whales accumulating suggests bullish sentiment' : 'Whale selling pressure may continue short-term'}`;
        }
        return `Whale tracking analysis completed. Monitoring large wallet movements and exchange flows for market intelligence.`;
      },

      narrative_scanner: () => {
        const sentiment = marketData?.marketSentiment?.trendingSentiment || 'neutral';
        return `**NARRATIVE INTELLIGENCE REPORT**

**Trending Narratives** (Confidence: 8.5/10):
- ${sentiment === 'bullish' ? 'Institutional adoption accelerating' : sentiment === 'bearish' ? 'Regulatory uncertainty themes' : 'Utility and real-world application focus'}
- DeFi evolution and yield optimization strategies
- Layer 2 scaling solutions gaining momentum

**Social Volume**: ${sentiment === 'bullish' ? '+25%' : sentiment === 'bearish' ? '-15%' : '±5%'} over 24h
**Sentiment Score**: ${sentiment === 'bullish' ? '7.2/10' : sentiment === 'bearish' ? '3.8/10' : '5.5/10'} (${sentiment})

**Strategic Positioning**: ${sentiment === 'bullish' ? 'Ride momentum narratives' : 'Focus on fundamentally strong contrarian plays'}`;
      },

      smart_alerts: () => {
        return `**SMART ALERT CONFIGURATION**

Alert system configured with dynamic thresholds based on current volatility.
**BTC Alerts**: Support $${marketData?.bitcoin?.price ? (marketData.bitcoin.price * 0.95).toFixed(0) : '105000'}, Resistance $${marketData?.bitcoin?.price ? (marketData.bitcoin.price * 1.05).toFixed(0) : '115000'}
**Volume Confirmation**: Required for all breakout alerts
**Risk Management**: Correlation alerts enabled for portfolio protection`;
      },

      altcoin_detector: () => {
        return `**ALTCOIN OPPORTUNITY SCAN**

**High-Potential Candidates** (Score: 8+/10):
- Layer 2 tokens: Strong technical setups with narrative support
- DeFi blue chips: Oversold with strong fundamentals
- Gaming tokens: Early accumulation phases detected

**Market Conditions**: ${marketData?.marketSentiment?.trendingSentiment === 'bullish' ? 'Favorable for altcoin expansion' : 'Selective opportunities only'}
**Risk Level**: MEDIUM - Requires careful position sizing`;
      },

      signals_pack: () => {
        const btcPrice = marketData?.bitcoin?.price || 112000;
        const direction = marketData?.bitcoin?.change24hPercent >= 0 ? 'LONG' : 'SHORT';
        return `**TRADING SIGNAL PACKAGE**

**BTC Signal**: ${direction} | Confidence: 85%
Entry: $${(btcPrice * (direction === 'LONG' ? 1.005 : 0.995)).toFixed(0)}
Target: $${(btcPrice * (direction === 'LONG' ? 1.025 : 0.975)).toFixed(0)}
Stop: $${(btcPrice * (direction === 'LONG' ? 0.985 : 1.015)).toFixed(0)}
R/R: 1:2.5 | Timeline: 2-5 days

**Market Regime**: ${marketData?.marketSentiment?.trendingSentiment?.toUpperCase() || 'CONSOLIDATION'}`;
      },

      ai_reports: () => {
        return `**AI MARKET INTELLIGENCE REPORT**

**Executive Summary**: Market showing ${marketData?.marketSentiment?.trendingSentiment || 'mixed'} signals with ${marketData?.bitcoin?.change24hPercent >= 0 ? 'bullish' : 'bearish'} undertones.

**Key Levels**: BTC $${marketData?.bitcoin?.price?.toLocaleString() || '112,000'}, ETH $${marketData?.ethereum?.price?.toLocaleString() || '4,200'}
**Market Cap**: $${(marketData?.marketSentiment?.totalMarketCap / 1e12)?.toFixed(2) || '2.8'}T
**Dominance**: BTC ${marketData?.marketSentiment?.dominanceBTC || '58'}%

**Strategic Outlook**: ${marketData?.bitcoin?.change24hPercent >= 0 ? 'Constructive setup for continued upside' : 'Defensive positioning recommended near-term'}`;
      }
    };

    return responses[tool]?.() || `${tool} analysis completed with current market data integration.`;
  }
}