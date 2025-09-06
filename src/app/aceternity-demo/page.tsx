"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Button } from "@/components/ui/stateful-button";
import { CometCard } from "@/components/ui/comet-card";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Bitcoin, TrendingUp, Shield, Zap } from "lucide-react";

export default function AceternityDemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Aceternity UI + ChainWise Theme Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing premium components with our purple/black theme
          </p>
        </div>

        {/* 3D Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-purple-400">3D Card Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Portfolio Card */}
            <CardContainer className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  Portfolio Analytics
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  AI-powered insights for your crypto investments
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bitcoin className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="font-semibold text-white">Bitcoin</p>
                          <p className="text-sm text-gray-300">BTC</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">$65,432</p>
                        <p className="text-sm text-green-400 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +5.23%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardItem>
                <div className="flex justify-between items-center mt-6">
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                  >
                    View Details →
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                  >
                    Analyze
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>

            {/* AI Features Card */}
            <CardContainer className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  AI Assistant
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  Get personalized trading advice from our AI personas
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">B</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Buddy</p>
                        <p className="text-gray-400 text-xs">Your crypto companion</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">P</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Professor</p>
                        <p className="text-gray-400 text-xs">Deep market analysis</p>
                      </div>
                    </div>
                  </div>
                </CardItem>
                <div className="flex justify-between items-center mt-6">
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                  >
                    Chat Now →
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                  >
                    Upgrade
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>

            {/* Security Card */}
            <CardContainer className="inter-var">
              <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                  Enterprise Security
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                  Bank-grade security for your crypto investments
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Shield className="h-6 w-6 text-green-400 mb-2" />
                      <span className="text-white text-xs font-medium">2FA Enabled</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <Zap className="h-6 w-6 text-purple-400 mb-2" />
                      <span className="text-white text-xs font-medium">Encrypted</span>
                    </div>
                  </div>
                </CardItem>
                <div className="flex justify-between items-center mt-6">
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                  >
                    Learn More →
                  </CardItem>
                  <CardItem
                    translateZ={20}
                    as="button"
                    className="px-4 py-2 rounded-xl bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                  >
                    Secure Now
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          </div>
        </section>

        {/* Stateful Buttons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-purple-400">Stateful Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium">
              Connect Wallet
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium">
              Start Trading
            </Button>
            <Button className="border border-purple-500 text-purple-400 hover:bg-purple-500/10 px-6 py-3 rounded-lg font-medium">
              Learn More
            </Button>
          </div>
        </section>

        {/* Comet Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-purple-400">Comet Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CometCard className="p-6 bg-black border border-purple-500/20">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Premium Features</h3>
                <p className="text-gray-300 mb-6">
                  Unlock advanced analytics and AI-powered insights
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                  Upgrade to Pro
                </button>
              </div>
            </CometCard>

            <CometCard className="p-6 bg-black border border-blue-500/20">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Elite Access</h3>
                <p className="text-gray-300 mb-6">
                  Join the elite tier for exclusive trading strategies
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium">
                  Go Elite
                </button>
              </div>
            </CometCard>
          </div>
        </section>

        {/* Pointer Highlight Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-purple-400">Interactive Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PointerHighlight className="p-6 rounded-xl border border-purple-500/20 bg-black/50 hover:bg-purple-500/5 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">Smart Alerts</h3>
              <p className="text-gray-400 text-sm">
                Get notified when your favorite cryptos hit target prices
              </p>
            </PointerHighlight>

            <PointerHighlight className="p-6 rounded-xl border border-blue-500/20 bg-black/50 hover:bg-blue-500/5 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">Portfolio Tracking</h3>
              <p className="text-gray-400 text-sm">
                Monitor your investments with real-time updates
              </p>
            </PointerHighlight>

            <PointerHighlight className="p-6 rounded-xl border border-green-500/20 bg-black/50 hover:bg-green-500/5 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
              <p className="text-gray-400 text-sm">
                Advanced market insights powered by artificial intelligence
              </p>
            </PointerHighlight>
          </div>
        </section>

        {/* Theme Verification */}
        <section className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-sm font-medium">
              Theme Integration: Successful ✨
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}