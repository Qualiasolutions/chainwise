import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-crypto-primary hover:text-crypto-secondary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Name and email address</li>
                <li>Account credentials (encrypted passwords)</li>
                <li>Profile information and preferences</li>
                <li>Subscription and payment information (processed by Stripe)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Portfolio data you choose to track</li>
                <li>AI chat interactions and preferences</li>
                <li>Feature usage and analytics</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage subscriptions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Provide personalized AI responses and recommendations</li>
                <li>Monitor and analyze usage patterns to improve our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers (e.g., Stripe for payments, OpenAI for AI services)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger or acquisition</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Security First:</strong> We implement industry-standard security measures to protect your data.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use encryption, secure servers, and regular security audits to protect your information. However, no method of transmission over the internet is 100% secure.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>All data is encrypted in transit and at rest</li>
                <li>Passwords are hashed using industry-standard algorithms</li>
                <li>We never store your private keys or trading credentials</li>
                <li>Regular security audits and updates</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Your Rights and Choices</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Update:</strong> Correct or update your information through your account settings</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Request an export of your portfolio and chat data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns</li>
                <li>Improve our services</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You can control cookies through your browser settings, but disabling them may affect the functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Third-Party Services</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ChainWise integrates with several third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Stripe:</strong> Payment processing (subject to Stripe&apos;s privacy policy)</li>
                <li><strong>OpenAI:</strong> AI chat responses (subject to OpenAI&apos;s privacy policy)</li>
                <li><strong>CoinGecko:</strong> Cryptocurrency market data (public data only)</li>
                <li><strong>Google OAuth:</strong> Optional login method (subject to Google&apos;s privacy policy)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Children&apos;s Privacy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ChainWise is not intended for use by children under 18. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about this Privacy Policy or our data practices, please contact us through our support channels or help center.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
