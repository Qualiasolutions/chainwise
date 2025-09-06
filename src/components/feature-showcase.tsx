import { BarChart3, Bell, TrendingUp, GraduationCap, Smartphone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: BarChart3,
    title: "Smart Portfolio Management",
    description:
      "Track unlimited cryptocurrencies with performance analytics & risk scoring plus diversification analysis",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Bell,
    title: "Intelligent Alerts",
    description: "Price, volume, and sentiment alerts with whale movement tracking and custom trigger conditions",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: TrendingUp,
    title: "AI Market Analysis",
    description: "Real-time market insights with predictive analytics and social sentiment tracking",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: GraduationCap,
    title: "ChainWise Academy",
    description: "Interactive learning modules with progress tracking, certifications & gamified learning experience",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: Smartphone,
    title: "Mobile App",
    description: "iOS & Android apps with real-time notifications and seamless synchronization across devices",
    gradient: "from-teal-500 to-cyan-600",
  },
]

export default function FeatureShowcase() {
  return (
    <div className="py-20 chainwise-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to make informed crypto investment decisions in one comprehensive platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="glass-card border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group hover:scale-105"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-14 h-14 mb-6 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>

                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
