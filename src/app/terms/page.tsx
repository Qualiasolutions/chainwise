import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - ChainWise',
  description: 'Terms of service for ChainWise AI-powered cryptocurrency advisory platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using ChainWise ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              ChainWise is an AI-powered cryptocurrency advisory platform that provides market analysis, portfolio management tools, and educational content. Our service includes:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Real-time cryptocurrency market data</li>
              <li>AI-powered investment insights</li>
              <li>Portfolio tracking and analytics</li>
              <li>Educational resources and tools</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Investment Disclaimer</h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                IMPORTANT: ChainWise does not provide financial advice.
              </p>
            </div>
            <p className="mb-4">
              All content provided by ChainWise is for informational and educational purposes only. We do not provide personalized investment advice, and our AI-generated insights should not be considered as recommendations to buy, sell, or hold any cryptocurrency or other financial instrument.
            </p>
            <p className="mb-4">
              Cryptocurrency investments are highly volatile and risky. You should conduct your own research and consult with qualified financial advisors before making any investment decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p className="mb-4">
              To access certain features of our Service, you may be required to create an account. You are responsible for:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
            <p className="mb-4">
              ChainWise offers both free and paid subscription tiers. Paid subscriptions include:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Enhanced AI insights and analysis</li>
              <li>Advanced portfolio tools</li>
              <li>Priority customer support</li>
              <li>Additional features as described in your plan</li>
            </ul>
            <p className="mb-4">
              Subscription fees are billed in advance and are non-refundable except as required by law or as specified in these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="mb-4">
              ChainWise shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service, including but not limited to:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Financial losses from investment decisions</li>
              <li>Service interruptions or downtime</li>
              <li>Data loss or corruption</li>
              <li>Security breaches beyond our control</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Continued use of the Service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at support@chainwise.tech
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}