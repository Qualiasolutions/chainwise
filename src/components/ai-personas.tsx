import { MessageCircle, GraduationCap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const personas = [
  {
    name: "Buddy",
    tier: "All tiers",
    icon: MessageCircle,
    description: "Your encouraging crypto companion for learning basics",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    name: "Professor",
    tier: "Pro & Elite",
    icon: GraduationCap,
    description: "Deep market analysis and educational insights",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "Trader",
    tier: "Elite only",
    icon: TrendingUp,
    description: "Advanced trading strategies and market timing",
    gradient: "from-purple-400 to-pink-500",
  },
]

export default function AIPersonas() {
  return (
    <div className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Meet Your{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Investment Team
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Three specialized AI personas designed to guide you through every aspect of crypto investing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona, index) => {
            const IconComponent = persona.icon
            return (
              <Card
                key={index}
                className="glass-card border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${persona.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{persona.name}</h3>

                  <div className="inline-block px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm mb-4">
                    {persona.tier}
                  </div>

                  <p className="text-gray-400 leading-relaxed">{persona.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
