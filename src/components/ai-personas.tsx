import { Card, CardContent } from "@/components/ui/card"
import { BuddyCharacter } from "@/components/ai-characters/buddy-character"
import { ProfessorCharacter } from "@/components/ai-characters/professor-character"
import { TraderCharacter } from "@/components/ai-characters/trader-character"
import { motion } from "framer-motion"

const personas = [
  {
    name: "Buddy",
    tier: "All tiers",
    character: BuddyCharacter,
    description: "Your encouraging crypto companion for learning basics",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    name: "Professor",
    tier: "Pro & Elite",
    character: ProfessorCharacter,
    description: "Deep market analysis and educational insights",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    name: "Trader",
    tier: "Elite only",
    character: TraderCharacter,
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
            const CharacterComponent = persona.character
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass-card border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 group hover:shadow-2xl hover:shadow-purple-500/20">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="mb-6"
                    >
                      <CharacterComponent />
                    </motion.div>

                    <motion.h3 
                      className="text-2xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300"
                    >
                      {persona.name}
                    </motion.h3>

                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 text-sm mb-4 border border-gray-600/50 group-hover:border-gray-500/50 transition-all duration-300"
                    >
                      {persona.tier}
                    </motion.div>

                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {persona.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
