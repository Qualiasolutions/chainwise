"use client";

import * as React from "react";
import { Paperclip, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Hero1 = () => {
  const [inputValue, setInputValue] = React.useState("");
  const router = useRouter();

  const handleChatStart = (initialMessage?: string) => {
    if (initialMessage) {
      // Store the initial message in session storage to pick up in chat
      sessionStorage.setItem('chatInitialMessage', initialMessage);
    }
    router.push('/chat');
  };

  const suggestionPills = [
    "Launch a crypto portfolio tracker",
    "Analyze Bitcoin market trends", 
    "Build DeFi dashboard with Next.js",
    "Generate AI trading insights",
    "Create crypto price alerts",
  ];

  return (
    <div className="min-h-screen bg-[#0c0414] text-white flex flex-col relative overflow-x-hidden">
      {/* Enhanced Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient beams */}
        <div className="flex gap-40 rotate-[-20deg] absolute top-[-40rem] right-[-30rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50">
          <div className="w-40 h-80 bg-gradient-to-b from-white to-blue-300"></div>
          <div className="w-40 h-80 bg-gradient-to-b from-white to-blue-300"></div>
          <div className="w-40 h-80 bg-gradient-to-b from-white to-blue-300"></div>
        </div>
        <div className="flex gap-40 rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg] opacity-40">
          <div className="w-40 h-80 bg-gradient-to-b from-white to-purple-300"></div>
          <div className="w-40 h-80 bg-gradient-to-b from-white to-purple-300"></div>
          <div className="w-40 h-80 bg-gradient-to-b from-white to-purple-300"></div>
        </div>
        <div className="flex gap-40 rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg] opacity-30">
          <div className="w-40 h-96 bg-gradient-to-b from-chainwise-primary-400 to-chainwise-accent-400"></div>
          <div className="w-40 h-96 bg-gradient-to-b from-chainwise-primary-400 to-chainwise-accent-400"></div>
          <div className="w-40 h-96 bg-gradient-to-b from-chainwise-primary-400 to-chainwise-accent-400"></div>
        </div>
      </div>

      {/* Header */}
      <header className="flex justify-between items-center p-6 relative z-10">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-chainwise-primary-500 to-chainwise-accent-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div className="font-bold text-md">ChainWise AI</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button 
            className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
            onClick={() => handleChatStart()}
          >
            Get Started
          </Button>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div 
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-[#1c1528] rounded-full px-4 py-2 flex items-center gap-2 w-fit mx-4 border border-purple-500/20">
              <span className="text-xs flex items-center gap-2">
                <span className="bg-gradient-to-r from-chainwise-primary-500 to-chainwise-accent-500 p-1 rounded-full text-xs">
                  🚀
                </span>
                Introducing AI-Powered Crypto Intelligence
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Master Crypto Markets with AI Intelligence
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            ChainWise AI provides professional crypto analysis, portfolio management, and market insights through advanced AI personas.
          </motion.p>

          {/* Search bar */}
          <motion.div 
            className="relative max-w-2xl mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-[#1c1528] rounded-full p-3 flex items-center border border-purple-500/30 backdrop-blur-sm">
              <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </button>
              <input
                type="text"
                placeholder="How can ChainWise AI help you today?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-transparent flex-1 outline-none text-gray-100 placeholder:text-gray-400 pl-4"
              />
              <Button
                size="sm"
                className="bg-gradient-to-r from-chainwise-primary-500 to-chainwise-accent-500 hover:opacity-90 rounded-full px-6"
                onClick={() => handleChatStart(inputValue || 'Hello, I want to learn about cryptocurrency')}
              >
                Ask AI
              </Button>
            </div>
          </motion.div>

          {/* Suggestion pills */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mt-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            {suggestionPills.map((suggestion, index) => (
              <motion.button
                key={index}
                className="bg-[#1c1528] hover:bg-[#2a1f3d] border border-purple-500/20 hover:border-purple-500/40 rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                onClick={() => handleChatStart(suggestion)}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>

          {/* AI Personas Preview */}
          <motion.div
            className="grid md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            {[
              { name: "Buddy", desc: "Crypto education & guidance", icon: "🤖", color: "from-emerald-500 to-teal-600" },
              { name: "Professor", desc: "Market analysis & insights", icon: "🧠", color: "from-blue-500 to-indigo-600" },
              { name: "Trader", desc: "Advanced strategies", icon: "📈", color: "from-purple-500 to-pink-600" }
            ].map((persona, index) => (
              <motion.div
                key={persona.name}
                className="bg-[#1c1528]/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all duration-300 hover:bg-[#2a1f3d]/30"
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center mb-3 mx-auto`}>
                  <span className="text-xl">{persona.icon}</span>
                </div>
                <h3 className="font-semibold text-white mb-1">{persona.name}</h3>
                <p className="text-gray-400 text-sm">{persona.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export { Hero1 };