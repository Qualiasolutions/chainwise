"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { ArrowRight, TrendingUp, Sparkles, Shield, Zap } from "lucide-react";

// Generate realistic crypto price data points with upward trend
const generateChartData = (points: number = 100) => {
  const data: { x: number; y: number }[] = [];
  let basePrice = 100;

  for (let i = 0; i < points; i++) {
    // Upward trend with realistic volatility
    const volatility = (Math.random() - 0.3) * 8; // Slight upward bias
    const trend = i * 0.45; // Strong upward trend
    basePrice = Math.max(50, basePrice + volatility + trend * 0.05);
    data.push({ x: i, y: basePrice });
  }

  return data;
};

// Animated particles in background
const Particle = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-purple-400/30"
      initial={{ x: Math.random() * 100 + "%", y: "100%", opacity: 0 }}
      animate={{
        y: "-20%",
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    />
  );
};

export default function CryptoChartHero() {
  const { user } = useSupabaseAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData] = useState(() => generateChartData(100));
  const [currentPoint, setCurrentPoint] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Animation loop
    let animationFrame: number;
    let progress = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate visible points
      progress += 0.5;
      const visiblePoints = Math.min(
        Math.floor((progress / 100) * chartData.length),
        chartData.length
      );

      if (visiblePoints < chartData.length) {
        setCurrentPoint(visiblePoints);
      }

      // Calculate scale
      const maxY = Math.max(...chartData.map((d) => d.y));
      const minY = Math.min(...chartData.map((d) => d.y));
      const scaleX = width / (chartData.length - 1);
      const scaleY = height / (maxY - minY);

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(155, 135, 245, 0.3)");
      gradient.addColorStop(1, "rgba(155, 135, 245, 0.0)");

      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < visiblePoints; i++) {
        const x = chartData[i].x * scaleX;
        const y = height - (chartData[i].y - minY) * scaleY;

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(visiblePoints * scaleX, height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw main line
      ctx.beginPath();
      ctx.strokeStyle = "#9b87f5";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(155, 135, 245, 0.5)";
      ctx.shadowBlur = 15;

      for (let i = 0; i < visiblePoints; i++) {
        const x = chartData[i].x * scaleX;
        const y = height - (chartData[i].y - minY) * scaleY;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw glow point at current position
      if (visiblePoints > 0 && visiblePoints < chartData.length) {
        const currentX = chartData[visiblePoints - 1].x * scaleX;
        const currentY = height - (chartData[visiblePoints - 1].y - minY) * scaleY;

        // Outer glow
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(155, 135, 245, 0.3)";
        ctx.fill();

        // Inner point
        ctx.beginPath();
        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#9b87f5";
        ctx.fill();
      }

      // Continue animation
      if (visiblePoints < chartData.length) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [chartData]);

  const stats = [
    { icon: TrendingUp, label: "Average ROI", value: "+284%", color: "text-green-400" },
    { icon: Shield, label: "Protected Assets", value: "$2.4B", color: "text-blue-400" },
    { icon: Zap, label: "Active Users", value: "50K+", color: "text-purple-400" },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <Particle key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(155, 135, 245, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(155, 135, 245, 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Gradient Orbs */}
      <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-purple-500/20 blur-[120px]" />
      <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-blue-500/20 blur-[120px]" />

      <div className="container relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-20 md:px-6">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 self-start"
            >
              <span className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                AI-Powered Intelligence
              </span>
            </motion.div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                Trade Smarter
                <br />
                with{" "}
                <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  ChainWise AI
                </span>
              </h1>
              <p className="text-lg text-slate-300 md:text-xl">
                Professional-grade crypto analysis powered by advanced AI. Make informed
                decisions with real-time market intelligence and personalized insights.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={user ? "/dashboard" : "/auth/signup"}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/60"
                >
                  <span className="relative z-10">
                    {user ? "Go to Dashboard" : "Start Free Trial"}
                  </span>
                  <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:bg-white/10"
                >
                  Explore Features
                </Link>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <stat.icon className={`mb-2 h-6 w-6 ${stat.color}`} />
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Animated Chart */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Glass Card Container */}
            <div className="relative w-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
              {/* Chart Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-slate-400">Market Performance</h3>
                  <p className="text-3xl font-bold text-white">
                    ${(chartData[currentPoint]?.y || 100).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-semibold text-green-400">+284%</span>
                </div>
              </div>

              {/* Canvas Chart */}
              <div className="relative h-[300px] w-full md:h-[400px]">
                <canvas
                  ref={canvasRef}
                  className="h-full w-full rounded-xl"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* Time Labels */}
              <div className="mt-6 flex justify-between text-xs text-slate-500">
                <span>Jan</span>
                <span>Mar</span>
                <span>Jun</span>
                <span>Sep</span>
                <span>Dec</span>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-blue-500/20 blur-3xl" />
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute -right-4 top-8 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/10 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Your Portfolio</div>
                  <div className="text-lg font-bold text-green-400">+142%</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-slate-500"
          >
            <span className="text-xs">Scroll to explore</span>
            <div className="h-6 w-4 rounded-full border-2 border-slate-500">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-slate-500"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
