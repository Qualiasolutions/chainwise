"use client"

import { useEffect, useState } from "react"

const stats = [
  { label: "Assets Analyzed", value: "2.5B+", prefix: "$" },
  { label: "Prediction Accuracy", value: "94%", prefix: "" },
  { label: "Active Users", value: "50K+", prefix: "" },
  { label: "Market Monitoring", value: "24/7", prefix: "" },
]

export default function TrustIndicators() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="py-20 chainwise-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Join the growing community of smart investors who trust ChainWise for their crypto investment decisions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="glass-card rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                  {mounted && (
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {stat.prefix}
                      {stat.value}
                    </span>
                  )}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
