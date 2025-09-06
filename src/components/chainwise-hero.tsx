"use client"

import { Button } from "@/components/ui/button"
import { Play, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import PulsingBorderShader from "./pulsing-border-shader"
import { ArrowRightIcon } from "@radix-ui/react-icons"

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
            {/* ChainWise Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card">
                <div className="relative">
                  <img
                    src="https://www.chainwise.tech/logo.png"
                    alt="ChainWise Logo"
                    className="w-10 h-10 rounded-full"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(155, 135, 245, 0.4))',
                    }}
                  />
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(155, 135, 245, 0.3), rgba(155, 135, 245, 0.1), rgba(155, 135, 245, 0.3))',
                      filter: 'blur(1px)'
                    }}
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  ChainWise
                </span>
              </div>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="text-balance text-white">Trade Smarter with</span>
              <br />
              <span className="text-indigo-300 bg-gradient-to-r from-indigo-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-balance text-white">Crypto Insights</span>
            </h1>

            {/* Subtext */}
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-4xl text-balance">
              ChainWise combines artificial intelligence with cutting-edge trading strategies to help you maximize your
              crypto investments with precision and ease.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-start">
              <a href="/chat">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-6 text-lg rounded-full group shadow-2xl shadow-indigo-500/25"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>

              <a href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-600 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-full bg-transparent group"
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Learn How It Works
                </Button>
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow effect behind the shader */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl scale-110" />

              {/* Main shader component */}
              <div className="relative">
                <PulsingBorderShader />
              </div>

              {/* Floating elements */}
              {mounted && (
                <>
                  <div
                    className="absolute -top-4 -right-4 w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="absolute top-1/3 -left-6 w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "1s" }}
                  />
                  <div
                    className="absolute bottom-1/4 -right-8 w-4 h-4 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "2s" }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
