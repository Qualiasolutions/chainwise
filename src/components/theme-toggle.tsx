"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0 theme-transition hover:bg-accent/50"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="theme-transition bg-card/95 backdrop-blur-sm border-border/50"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="theme-transition hover:bg-accent/80"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="theme-transition hover:bg-accent/80"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="theme-transition hover:bg-accent/80"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SimpleThemeToggle() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 px-0 theme-transition hover:bg-accent/50 border border-transparent hover:border-primary/20"
    >
      <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}