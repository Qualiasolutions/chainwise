"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Bitcoin, 
  BarChart3, 
  MessageSquare, 
  Shield, 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  Globe,
  FileText,
  Users,
  BookOpen,
  HeadphonesIcon,
  MapPin
} from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Dashboard", href: "/dashboard", icon: <BarChart3 className="w-4 h-4" /> },
        { name: "Portfolio", href: "/portfolio", icon: <Bitcoin className="w-4 h-4" /> },
        { name: "AI Chat", href: "/chat", icon: <MessageSquare className="w-4 h-4" /> },
        { name: "Analytics", href: "/analytics", icon: <BarChart3 className="w-4 h-4" /> },
        { name: "Alerts", href: "/alerts", icon: <Shield className="w-4 h-4" /> }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about", icon: <Users className="w-4 h-4" /> },
        { name: "Blog", href: "/blog", icon: <BookOpen className="w-4 h-4" /> },
        { name: "Careers", href: "/careers", icon: <Globe className="w-4 h-4" /> },
        { name: "Contact", href: "/contact", icon: <Mail className="w-4 h-4" /> },
        { name: "Press Kit", href: "/press", icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help", icon: <HeadphonesIcon className="w-4 h-4" /> },
        { name: "API Docs", href: "/docs/api", icon: <FileText className="w-4 h-4" /> },
        { name: "Community", href: "/community", icon: <Users className="w-4 h-4" /> },
        { name: "Security", href: "/security", icon: <Shield className="w-4 h-4" /> },
        { name: "Status", href: "/status", icon: <Globe className="w-4 h-4" /> }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy", icon: <Shield className="w-4 h-4" /> },
        { name: "Terms of Service", href: "/terms", icon: <FileText className="w-4 h-4" /> },
        { name: "Cookie Policy", href: "/cookies", icon: <FileText className="w-4 h-4" /> },
        { name: "Compliance", href: "/compliance", icon: <Shield className="w-4 h-4" /> }
      ]
    }
  ]

  const socialLinks = [
    { name: "Twitter", href: "https://twitter.com/chainwise", icon: <Twitter className="w-5 h-5" /> },
    { name: "LinkedIn", href: "https://linkedin.com/company/chainwise", icon: <Linkedin className="w-5 h-5" /> },
    { name: "GitHub", href: "https://github.com/chainwise", icon: <Github className="w-5 h-5" /> },
    { name: "Email", href: "mailto:support@chainwise.ai", icon: <Mail className="w-5 h-5" /> }
  ]

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 border-t border-gray-800">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">ChainWise</span>
            </Link>
            
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              Your AI-powered crypto investment advisor. Make smarter trading decisions with advanced analytics, 
              real-time market insights, and personalized investment strategies.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Stay Updated</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold text-lg mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="flex items-center space-x-3 text-gray-400 hover:text-purple-400 transition-colors duration-300 group"
                    >
                      <span className="text-gray-500 group-hover:text-purple-400 transition-colors">
                        {link.icon}
                      </span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-12"></div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          {/* Company Info */}
          <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
            <div className="text-gray-400 text-center lg:text-left">
              <p className="flex items-center justify-center lg:justify-start space-x-2">
                <MapPin className="w-4 h-4" />
                <span>© {currentYear} ChainWise AI. All rights reserved.</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm">256-bit SSL</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/50 transition-all duration-300"
                aria-label={social.name}
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Legal Notice */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm text-center leading-relaxed">
            ChainWise is a financial technology platform. Cryptocurrency trading involves substantial risk of loss. 
            Past performance is not indicative of future results. Please trade responsibly and only with funds you can afford to lose.
          </p>
        </div>
      </div>
    </footer>
  )
}