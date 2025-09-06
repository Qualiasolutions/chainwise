'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useSupabase } from '@/components/providers/supabase-provider'
import { useSubscription } from '@/hooks/use-subscription'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Zap, 
  Crown, 
  Star, 
  BarChart3, 
  FileText, 
  Radio, 
  Eye,
  ShoppingCart,
  CreditCard,
  Loader2,
  Sparkles,
  Lock,
  Unlock,
  Gift,
  Rocket,
  Shield,
  Award,
  Target,
  Brain,
  Lightbulb,
  ChevronRight,
  ArrowRight
} from 'lucide-react'

interface PremiumFeature {
  id: string
  feature_key: string
  name: string
  description: string
  category: string
  credit_cost: number
  pricing_usd: string | null
  required_tier: 'free' | 'pro' | 'elite'
  metadata: {
    frequency?: string
    benefits?: string[]
    popular?: boolean
  }
}

interface FeaturesData {
  user: {
    tier: string
    credits: number
  }
  features: Record<string, PremiumFeature[]>
  totalFeatures: number
}

const categoryConfig: Record<string, { icon: JSX.Element; name: string; gradient: string; description: string }> = {
  'analysis': {
    icon: <Brain className="w-6 h-6" />,
    name: 'AI Analysis Tools',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Advanced AI-powered market analysis and predictions'
  },
  'reports': {
    icon: <FileText className="w-6 h-6" />,
    name: 'Premium Reports',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Comprehensive insights and detailed portfolio reports'
  }, 
  'signals': {
    icon: <Radio className="w-6 h-6" />,
    name: 'Trading Signals',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Real-time alerts and trading opportunities'
  },
  'tracking': {
    icon: <Target className="w-6 h-6" />,
    name: 'Smart Tracking',
    gradient: 'from-orange-500 to-red-500',
    description: 'Automated portfolio monitoring and alerts'
  }
}

const tierConfig = {
  free: {
    color: 'bg-gradient-to-r from-gray-400 to-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50 dark:bg-gray-900',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: <Star className="w-5 h-5" />,
    label: 'Starter'
  },
  pro: {
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: <Zap className="w-5 h-5" />,
    label: 'Professional'
  },
  elite: {
    color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: <Crown className="w-5 h-5" />,
    label: 'Elite'
  }
}

export function PremiumFeaturesMarketplaceEnhanced() {
  const [featuresData, setFeaturesData] = useState<FeaturesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasingFeature, setPurchasingFeature] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  const { session } = useSupabase()
  const { creditBalance, refreshCreditBalance } = useSubscription()

  useEffect(() => {
    if (session) {
      fetchFeatures()
    }
  }, [session])

  const fetchFeatures = async () => {
    try {
      // Mock data for demonstration
      const mockData: FeaturesData = {
        user: {
          tier: 'pro',
          credits: creditBalance || 50
        },
        features: {
          analysis: [
            {
              id: '1',
              feature_key: 'ai_market_analysis',
              name: 'AI Market Analysis',
              description: 'Deep learning powered market predictions and trend analysis',
              category: 'analysis',
              credit_cost: 10,
              pricing_usd: '4.99',
              required_tier: 'free',
              metadata: {
                frequency: 'per_analysis',
                benefits: ['Real-time analysis', 'Accuracy score', 'Historical comparison'],
                popular: true
              }
            },
            {
              id: '2',
              feature_key: 'portfolio_optimizer',
              name: 'Portfolio Optimizer',
              description: 'AI-driven portfolio rebalancing suggestions',
              category: 'analysis',
              credit_cost: 15,
              pricing_usd: '7.99',
              required_tier: 'pro',
              metadata: {
                frequency: 'monthly',
                benefits: ['Risk assessment', 'Optimal allocation', 'Performance projection']
              }
            }
          ],
          reports: [
            {
              id: '3',
              feature_key: 'monthly_report',
              name: 'Monthly Performance Report',
              description: 'Comprehensive monthly portfolio analysis with insights',
              category: 'reports',
              credit_cost: 20,
              pricing_usd: '9.99',
              required_tier: 'pro',
              metadata: {
                frequency: 'monthly',
                benefits: ['PDF export', 'Tax insights', 'Performance metrics'],
                popular: true
              }
            }
          ],
          signals: [
            {
              id: '4',
              feature_key: 'whale_alerts',
              name: 'Whale Movement Alerts',
              description: 'Real-time notifications of large crypto transactions',
              category: 'signals',
              credit_cost: 5,
              pricing_usd: '2.99',
              required_tier: 'free',
              metadata: {
                frequency: 'per_alert',
                benefits: ['Instant notifications', 'Transaction details', 'Market impact analysis']
              }
            }
          ],
          tracking: [
            {
              id: '5',
              feature_key: 'smart_dca',
              name: 'Smart DCA Tracking',
              description: 'Automated dollar-cost averaging strategy monitoring',
              category: 'tracking',
              credit_cost: 25,
              pricing_usd: '12.99',
              required_tier: 'elite',
              metadata: {
                frequency: 'monthly',
                benefits: ['Auto-tracking', 'Performance metrics', 'Strategy optimization']
              }
            }
          ]
        },
        totalFeatures: 5
      }
      
      setFeaturesData(mockData)
    } catch (error) {
      toast.error('Failed to load premium features')
    } finally {
      setLoading(false)
    }
  }

  const canAccessFeature = (feature: PremiumFeature) => {
    if (!featuresData) return false
    
    const tierOrder = { 'free': 0, 'pro': 1, 'elite': 2 }
    const userTierLevel = tierOrder[featuresData.user.tier as keyof typeof tierOrder] || 0
    const requiredTierLevel = tierOrder[feature.required_tier as keyof typeof tierOrder] || 0
    
    return userTierLevel >= requiredTierLevel
  }

  const handlePurchaseWithCredits = async (feature: PremiumFeature) => {
    if (!featuresData || featuresData.user.credits < feature.credit_cost) {
      toast.error(`Insufficient credits. You need ${feature.credit_cost} credits.`)
      return
    }

    setPurchasingFeature(feature.id)
    
    // Simulate purchase
    setTimeout(() => {
      toast.success(`Successfully unlocked ${feature.name}!`)
      setPurchasingFeature(null)
      
      // Update local state
      setFeaturesData(prev => prev ? {
        ...prev,
        user: {
          ...prev.user,
          credits: prev.user.credits - feature.credit_cost
        }
      } : null)
    }, 1500)
  }

  const handlePurchaseWithUSD = async (feature: PremiumFeature) => {
    setPurchasingFeature(feature.id)
    
    // Simulate checkout
    setTimeout(() => {
      toast.info('Redirecting to checkout...')
      setPurchasingFeature(null)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading premium features...</p>
        </motion.div>
      </div>
    )
  }

  if (!featuresData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Failed to load premium features</p>
            <Button onClick={fetchFeatures} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userTierConfig = tierConfig[featuresData.user.tier as keyof typeof tierConfig] || tierConfig.free

  return (
    <div className="min-h-screen chainwise-gradient py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Premium Features Store
            </span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Unlock Advanced Features
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Enhance your crypto journey with AI-powered tools, real-time signals, and professional analytics.
          </p>
          
          {/* User Stats */}
          <div className="flex items-center justify-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`px-6 py-3 rounded-xl ${userTierConfig.bgColor} ${userTierConfig.borderColor} border-2`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${userTierConfig.color} text-white`}>
                  {userTierConfig.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Tier</p>
                  <p className="font-bold text-lg">{userTierConfig.label}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Credits</p>
                  <p className="font-bold text-lg">{featuresData.user.credits}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Features Unlocked</p>
                  <p className="font-bold text-lg">12</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              className={cn(
                "group relative px-6 py-4 rounded-xl transition-all duration-300",
                selectedCategory === key 
                  ? "bg-gradient-to-r " + config.gradient + " text-white shadow-xl scale-105"
                  : "bg-white dark:bg-gray-800 hover:shadow-lg border border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "transition-all duration-300",
                  selectedCategory === key ? "text-white" : "text-gray-600 dark:text-gray-400"
                )}>
                  {config.icon}
                </div>
                <div className="text-left">
                  <p className={cn(
                    "font-semibold",
                    selectedCategory === key ? "text-white" : "text-gray-900 dark:text-white"
                  )}>
                    {config.name}
                  </p>
                  <p className={cn(
                    "text-sm",
                    selectedCategory === key ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {featuresData.features[key]?.length || 0} features
                  </p>
                </div>
              </div>
              
              {selectedCategory === key && (
                <motion.div
                  layoutId="category-highlight"
                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Features Grid */}
        <AnimatePresence mode="wait">
          {Object.entries(featuresData.features)
            .filter(([category]) => !selectedCategory || category === selectedCategory)
            .map(([category, features]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${categoryConfig[category].gradient} text-white`}>
                    {categoryConfig[category].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {categoryConfig[category].name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {categoryConfig[category].description}
                    </p>
                  </div>
                </div>
                
                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => {
                    const hasAccess = canAccessFeature(feature)
                    const isPurchasing = purchasingFeature === feature.id
                    const isHovered = hoveredFeature === feature.id
                    
                    return (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        onHoverStart={() => setHoveredFeature(feature.id)}
                        onHoverEnd={() => setHoveredFeature(null)}
                      >
                        <Card className={cn(
                          "relative h-full transition-all duration-300 overflow-hidden",
                          hasAccess 
                            ? "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600" 
                            : "border-gray-100 dark:border-gray-800 opacity-75",
                          isHovered && "shadow-2xl"
                        )}>
                          {/* Popular Badge */}
                          {feature.metadata?.popular && (
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                                <Rocket className="w-3 h-3 mr-1" />
                                Popular
                              </Badge>
                            </div>
                          )}
                          
                          {/* Animated Background */}
                          <div className={cn(
                            "absolute inset-0 opacity-0 transition-opacity duration-500",
                            isHovered && "opacity-100"
                          )}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${categoryConfig[category].gradient} opacity-5`} />
                          </div>
                          
                          <CardHeader className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-lg bg-gradient-to-r ${categoryConfig[category].gradient} text-white`}>
                                {hasAccess ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                              </div>
                            </div>
                            
                            <CardTitle className="text-xl mb-2">{feature.name}</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              {feature.description}
                            </CardDescription>
                            
                            {/* Benefits List */}
                            {feature.metadata?.benefits && (
                              <div className="mt-4 space-y-2">
                                {feature.metadata.benefits.map((benefit, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardHeader>
                          
                          <CardContent className="relative z-10">
                            {/* Pricing */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                {feature.credit_cost > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <span className="font-bold">{feature.credit_cost}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">credits</span>
                                  </div>
                                )}
                                {feature.credit_cost > 0 && feature.pricing_usd && (
                                  <span className="text-gray-400">or</span>
                                )}
                                {feature.pricing_usd && (
                                  <div className="flex items-center gap-1">
                                    <span className="font-bold">${feature.pricing_usd}</span>
                                  </div>
                                )}
                              </div>
                              {feature.metadata?.frequency && (
                                <Badge variant="secondary" className="text-xs">
                                  {feature.metadata.frequency.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            {!hasAccess ? (
                              <Button 
                                disabled 
                                className="w-full"
                                variant="outline"
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Requires {tierConfig[feature.required_tier as keyof typeof tierConfig].label}
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                {feature.credit_cost > 0 && (
                                  <Button
                                    onClick={() => handlePurchaseWithCredits(feature)}
                                    disabled={isPurchasing || featuresData.user.credits < feature.credit_cost}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                                  >
                                    {isPurchasing ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Zap className="w-4 h-4 mr-2" />
                                    )}
                                    Use {feature.credit_cost} Credits
                                  </Button>
                                )}
                                
                                {feature.pricing_usd && (
                                  <Button
                                    onClick={() => handlePurchaseWithUSD(feature)}
                                    disabled={isPurchasing}
                                    className="w-full"
                                    variant="outline"
                                  >
                                    {isPurchasing ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <CreditCard className="w-4 h-4 mr-2" />
                                    )}
                                    Pay ${feature.pricing_usd}
                                  </Button>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="py-12">
              <Crown className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Upgrade to Elite</h3>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                Unlock all premium features, get unlimited AI analysis, and receive priority support with our Elite subscription.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Rocket className="w-5 h-5 mr-2" />
                  Upgrade Now
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
