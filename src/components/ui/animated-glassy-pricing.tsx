"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { MultiTypeRippleButton } from "./multi-type-ripple-buttons";
import { cn } from "@/lib/utils";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
}

interface AnimatedGlassyPricingProps {
  tiers: PricingTier[];
  className?: string;
  onSelectTier?: (tierId: string) => void;
}

export function AnimatedGlassyPricing({
  tiers,
  className,
  onSelectTier,
}: AnimatedGlassyPricingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");

    if (!gl) {
      console.warn("WebGL not supported, falling back to 2D canvas");
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

    // Fragment shader source with animated gradient
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;

        // Create animated waves
        float wave1 = sin(st.x * 10.0 + u_time * 0.8) * 0.1;
        float wave2 = cos(st.y * 8.0 + u_time * 0.6) * 0.1;
        float wave3 = sin((st.x + st.y) * 6.0 + u_time * 0.4) * 0.1;

        // Combine waves
        float waves = wave1 + wave2 + wave3;

        // Create gradient colors
        vec3 color1 = vec3(0.4, 0.2, 0.8); // Purple
        vec3 color2 = vec3(0.2, 0.4, 0.9); // Blue
        vec3 color3 = vec3(0.6, 0.3, 0.9); // Light purple

        // Mix colors based on position and waves
        vec3 finalColor = mix(color1, color2, st.x + waves * 0.3);
        finalColor = mix(finalColor, color3, st.y + waves * 0.2);

        // Add some brightness variation
        finalColor *= (1.0 + waves * 0.3);

        gl_FragColor = vec4(finalColor, 0.3);
      }
    `;

    // Helper function to create shader
    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full screen quad)
    const positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ];

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeUniformLocation = gl.getUniformLocation(program, "u_time");
    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    // Animation loop
    const startTime = Date.now();
    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000;

      gl.uniform1f(timeUniformLocation, currentTime);
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient]);

  if (!isClient) {
    return <div className="w-full h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800" />;
  }

  return (
    <div className={cn("relative w-full min-h-screen overflow-hidden", className)}>
      {/* WebGL Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: -1 }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Choose Your Plan
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Unlock the power of AI-driven crypto insights with our flexible pricing tiers
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative group",
                  "transform transition-all duration-500 hover:scale-105",
                  tier.popular && "md:-translate-y-4"
                )}
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Sparkles size={14} />
                      Most Popular
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "relative h-full p-8 rounded-2xl",
                    "bg-white/10 backdrop-blur-lg",
                    "border border-white/20",
                    "shadow-2xl shadow-black/20",
                    "transition-all duration-500",
                    "hover:bg-white/15 hover:border-white/30",
                    tier.popular && "border-2 border-yellow-400/50"
                  )}
                >
                  {/* Gradient Background */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-10 rounded-2xl",
                      tier.gradient
                    )}
                  />

                  {/* Icon */}
                  <div className="relative z-10 mb-6">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center",
                        "bg-gradient-to-r from-white/20 to-white/10",
                        "border border-white/20"
                      )}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Tier Info */}
                  <div className="relative z-10 mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{tier.description}</p>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        ${tier.price}
                      </span>
                      {tier.originalPrice && (
                        <span className="text-lg text-white/50 line-through ml-2">
                          ${tier.originalPrice}
                        </span>
                      )}
                      <span className="text-white/70">/{tier.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="relative z-10 mb-8 space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <div className="relative z-10">
                    <MultiTypeRippleButton
                      className={cn(
                        "w-full py-3 text-base font-semibold",
                        tier.popular
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                          : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700",
                        "border-0 shadow-lg"
                      )}
                      onClick={() => onSelectTier?.(tier.id)}
                    >
                      {tier.price === 0 ? "Get Started Free" : "Choose Plan"}
                    </MultiTypeRippleButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 text-sm">
            All plans include our AI-powered crypto insights and 24/7 support
          </p>
        </div>
      </div>
    </div>
  );
}