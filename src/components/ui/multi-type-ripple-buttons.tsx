"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MultiTypeRippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  rippleColor?: string;
}

export function MultiTypeRippleButton({
  children,
  className,
  onClick,
  disabled = false,
  variant = "default",
  size = "md",
  rippleColor = "rgba(255, 255, 255, 0.6)",
}: MultiTypeRippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  // Initialize ripple animation styles
  useRippleAnimation();

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prevRipples) => [...prevRipples, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prevRipples) => prevRipples.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      createRipple(event);
      onClick?.();
    }
  };

  const baseClasses = cn(
    "relative overflow-hidden transition-all duration-300 font-medium rounded-lg",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    disabled && "opacity-50 cursor-not-allowed"
  );

  const variantClasses = {
    default: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500",
    outline: "border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-500",
    ghost: "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 focus:ring-purple-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: rippleColor,
            transform: "scale(0)",
            animation: "ripple 0.6s linear",
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Add ripple animation using useEffect to avoid SSR issues
function useRippleAnimation() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const existingStyle = document.getElementById("ripple-animation");
    if (existingStyle) return;

    const style = document.createElement("style");
    style.id = "ripple-animation";
    style.textContent = `
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
`;
    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById("ripple-animation");
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
}