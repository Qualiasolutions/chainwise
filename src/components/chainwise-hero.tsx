"use client"

import { Button } from "@/components/ui/button"
import { Play, TrendingUp, Bitcoin, Shield, Zap, DollarSign, Activity, Coins } from "lucide-react"
import { useState, useEffect } from "react"
import PulsingBorderShader from "./pulsing-border-shader"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { CometCard } from "@/components/ui/comet-card"
import { PointerHighlight } from "@/components/ui/pointer-highlight"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { RippleButton } from "@/components/magicui/ripple-button"

export default function ChainWiseHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen chainwise-gradient text-white overflow-hidden relative">
      {/* Animated background shapes */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Text content */}
          <div className="space-y-8 lg:pr-8">

            {/* Main headline - Mobile-first responsive */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span className="text-balance text-white">Trade Smarter with</span>
              <br />
              <span className="bg-gradient-to-r from-chainwise-primary-400 via-chainwise-secondary-400 to-chainwise-accent-400 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-balance text-white">Crypto Insights</span>
            </h1>

            {/* Subtext - Responsive typography */}
            <p className="text-lg sm:text-xl md:text-2xl text-chainwise-neutral-300 leading-relaxed max-w-4xl text-balance">
              ChainWise combines artificial intelligence with cutting-edge trading strategies to help you maximize your
              crypto investments with precision and ease.
            </p>

            {/* CTAs - Enhanced with Modern Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              {/* Primary CTA - Get Started */}
              <ShimmerButton
                className="w-full sm:w-auto px-10 py-4 text-lg font-bold text-white hover:text-white transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 group"
                background="linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)"
                shimmerColor="#ffffff"
                shimmerSize="0.1em"
                shimmerDuration="2.5s"
                borderRadius="12px"
                onClick={() => window.location.href = '/chat'}
              >
                <span className="flex items-center justify-center gap-3 text-white font-bold tracking-wide">
                  Get Started
                  <ArrowRightIcon className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </span>
              </ShimmerButton>

              {/* Secondary CTA - Learn How It Works */}
              <RippleButton
                className="w-full sm:w-auto px-10 py-4 text-lg font-bold border-2 border-white/20 bg-white/5 backdrop-blur-md text-white hover:text-white hover:bg-white/10 hover:border-white/30 rounded-xl shadow-xl hover:shadow-white/10 transform hover:scale-105 transition-all duration-300 group"
                rippleColor="#ffffff"
                duration="800ms"
                onClick={() => window.location.href = '/dashboard'}
              >
                <span className="flex items-center justify-center gap-3 text-white font-bold tracking-wide">
                  <Play className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  Learn How It Works
                </span>
              </RippleButton>
            </div>
          </div>

          {/* Right side - 3D Interactive Elements */}
          <div className="flex justify-center lg:justify-end relative">
            {/* Main 3D Card Container with PulsingBorderShader */}
            <CardContainer className="inter-var">
              <CardBody className="relative group/card w-auto sm:w-[35rem] h-auto rounded-xl">
                {/* Central Pulsing Circle - Enhanced with 3D */}
                <CardItem
                  translateZ="100"
                  rotateX={5}
                  rotateY={5}
                  className="relative"
                >
                  {/* Glow effect behind the shader */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl scale-110" />
                  
                  {/* Main shader component */}
                  <div className="relative">
                    <PulsingBorderShader />
                    
                    {/* Orbiting Crypto Icons */}
                    {mounted && (
                      <>
                        {/* Bitcoin - Main position */}
                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s' }}>
                          <Bitcoin className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 text-orange-400 drop-shadow-lg" />
                        </div>
                        
                        {/* Ethereum representation - Coins icon */}
                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}>
                          <Coins className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-7 h-7 text-blue-400 drop-shadow-lg" />
                        </div>
                        
                        {/* DollarSign for USDC/Stablecoins */}
                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                          <DollarSign className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-7 h-7 text-green-400 drop-shadow-lg" />
                        </div>
                        
                        {/* Activity icon for DeFi/Trading */}
                        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '16s', animationDirection: 'reverse' }}>
                          <Activity className="absolute top-1/2 -left-6 transform -translate-y-1/2 w-6 h-6 text-purple-400 drop-shadow-lg" />
                        </div>
                        
                        {/* Inner orbiting smaller icons */}
                        <div className="absolute inset-4 animate-spin" style={{ animationDuration: '12s' }}>
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 shadow-lg" />
                        </div>
                        <div className="absolute inset-4 animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
                          <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-lg" />
                        </div>
                        <div className="absolute inset-4 animate-spin" style={{ animationDuration: '14s' }}>
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-green-500 shadow-lg" />
                        </div>
                      </>
                    )}
                  </div>
                </CardItem>

                {/* Floating 3D Feature Cards */}
                {mounted && (
                  <>
                    {/* AI Features Card - Top Right */}
                    <CardItem
                      translateZ="50"
                      translateX="100"
                      translateY="-80"
                      rotateY={10}
                      className="absolute -top-4 -right-8"
                    >
                      <CometCard className="p-4 bg-black/80 border border-purple-500/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">AI Assistant</p>
                            <p className="text-gray-400 text-xs">Active</p>
                          </div>
                        </div>
                      </CometCard>
                    </CardItem>

                    {/* Portfolio Card - Top Left */}
                    <CardItem
                      translateZ="60"
                      translateX="-120"
                      translateY="-60"
                      rotateY={-15}
                      className="absolute top-8 -left-12"
                    >
                      <PointerHighlight className="p-4 rounded-xl border border-blue-500/30 bg-black/80 backdrop-blur-sm hover:bg-blue-500/5 transition-colors">
                        <div className="flex items-center space-x-2">
                          <Bitcoin className="w-6 h-6 text-orange-400" />
                          <div>
                            <p className="text-white text-sm font-semibold">$65,432</p>
                            <p className="text-green-400 text-xs flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +5.23%
                            </p>
                          </div>
                        </div>
                      </PointerHighlight>
                    </CardItem>

                    {/* Security Card - Bottom Right */}
                    <CardItem
                      translateZ="40"
                      translateX="80"
                      translateY="100"
                      rotateY={8}
                      className="absolute bottom-0 -right-4"
                    >
                      <CometCard className="p-3 bg-black/80 border border-green-500/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-green-400" />
                          <span className="text-white text-xs font-medium">Secured</span>
                        </div>
                      </CometCard>
                    </CardItem>

                    {/* Animated floating particles */}
                    <CardItem
                      translateZ="20"
                      className="absolute -top-8 right-4 w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    />
                    <CardItem
                      translateZ="30"
                      className="absolute top-1/3 -left-8 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-70"
                      style={{ animationDelay: "1s" }}
                    />
                    <CardItem
                      translateZ="25"
                      className="absolute bottom-1/4 right-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce opacity-80"
                      style={{ animationDelay: "2s" }}
                    />
                  </>
                )}
              </CardBody>
            </CardContainer>

            {/* Additional moving background elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-12 left-8 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse" />
              <div className="absolute bottom-16 left-16 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
              <div className="absolute top-1/2 right-12 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
