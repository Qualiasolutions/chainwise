"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Crypto Trader",
    avatar: "SC",
    content: "ChainWise has transformed my trading strategy. The AI insights are incredibly accurate and have helped me make better investment decisions consistently.",
    rating: 5,
    bgColor: "bg-gradient-to-br from-purple-500 to-pink-500"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Portfolio Manager",
    avatar: "MR",
    content: "The real-time analytics and portfolio tracking features are game-changing. I've seen a 40% improvement in my portfolio performance since using ChainWise.",
    rating: 5,
    bgColor: "bg-gradient-to-br from-blue-500 to-cyan-500"
  },
  {
    id: 3,
    name: "Emma Johnson",
    role: "DeFi Investor",
    avatar: "EJ",
    content: "As someone new to crypto, ChainWise's AI guidance has been invaluable. The educational resources and insights make complex concepts easy to understand.",
    rating: 5,
    bgColor: "bg-gradient-to-br from-green-500 to-emerald-500"
  }
];

const stats = [
  { label: "Active Users", value: "50K+", icon: "👥" },
  { label: "Portfolio Value Tracked", value: "$2.3B+", icon: "💰" },
  { label: "AI Predictions Accuracy", value: "94%", icon: "🎯" },
  { label: "Countries Served", value: "120+", icon: "🌍" }
];

export default function TestimonialsSection() {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center justify-center py-16 px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6">
            Trusted by Traders
            <br />
            <span className="text-purple-600">Worldwide</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Join thousands of successful traders who rely on ChainWise's AI-powered insights
            to make smarter investment decisions in the crypto market.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-white/70 rounded-2xl backdrop-blur-sm border border-slate-200 shadow-lg"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6">
                <Quote className="w-6 h-6 text-purple-400" />
              </div>

              {/* Avatar and Info */}
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-full ${testimonial.bgColor} flex items-center justify-center text-white font-bold text-lg mr-4`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                  <p className="text-slate-600 text-sm">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 leading-relaxed">{testimonial.content}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Join Them?
              </h3>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                Start your journey with ChainWise today and experience the power of AI-driven crypto trading.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors duration-300">
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors duration-300">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}