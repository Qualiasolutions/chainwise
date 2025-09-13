import Link from 'next/link'
import { ArrowLeft, MessageCircle, Mail, Book, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HelpPage() {
  const helpSections = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn how to use ChainWise AI and get the most out of your crypto journey",
      items: [
        "How to create your first portfolio",
        "Understanding AI personas (Buddy, Professor, Trader)",
        "Using the chat interface effectively",
        "Managing your credit balance"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Account & Security",
      description: "Manage your account settings and keep your data secure",
      items: [
        "Account registration and verification",
        "Password reset and security",
        "Subscription management",
        "Privacy settings"
      ]
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Features & Tools",
      description: "Explore all the powerful features ChainWise has to offer",
      items: [
        "Portfolio tracking and analytics",
        "Price alerts and notifications",
        "AI-powered market insights",
        "Educational resources"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-crypto-primary hover:text-crypto-secondary mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find answers to common questions and get support for using ChainWise
          </p>
        </div>

        {/* Help Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpSections.map((section, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-crypto-primary/10 rounded-lg text-crypto-primary">
                    {section.icon}
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                      <span className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="bg-gradient-to-r from-crypto-primary to-crypto-secondary text-white">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Need More Help?</span>
            </CardTitle>
            <CardDescription className="text-white/80">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="secondary" className="bg-white text-crypto-primary hover:bg-gray-100">
                Contact Support
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Join Community
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I get started with ChainWise?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Simply create an account and you&apos;ll receive 3 free credits to start exploring our AI chat features. 
                  You can create portfolios, ask questions to our AI personas, and access educational content.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What are credits and how do they work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Credits are used to access premium features like AI chat responses, portfolio analytics, and advanced insights. 
                  Free users get 3 credits monthly, Pro users get 50, and Elite users get 200.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my financial data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, we take security seriously. All data is encrypted, and we never store your private keys or passwords. 
                  ChainWise is designed for portfolio tracking and education, not for executing trades.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
