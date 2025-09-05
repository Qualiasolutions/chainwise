import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-crypto-primary hover:text-crypto-secondary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                By accessing and using ChainWise (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ChainWise is an AI-powered cryptocurrency education and portfolio tracking platform. We provide:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>AI-powered chat assistance for cryptocurrency education</li>
                <li>Portfolio tracking and analytics tools</li>
                <li>Educational content and resources</li>
                <li>Market insights and analysis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Subscription and Payments</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ChainWise offers multiple subscription tiers:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li><strong>Free:</strong> 3 credits per month, basic features</li>
                <li><strong>Pro ($12.99/month):</strong> 50 credits per month, advanced features</li>
                <li><strong>Elite ($24.99/month):</strong> 200 credits per month, premium features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Educational Purpose Disclaimer</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  <strong>Important:</strong> ChainWise is for educational purposes only and does not provide financial advice.
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                All content, analysis, and AI responses provided by ChainWise are for educational purposes only and should not be considered as financial, investment, or trading advice. 
                Cryptocurrency investments carry significant risk, and you should always do your own research and consult with qualified financial advisors before making any investment decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Prohibited Uses</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You may not use ChainWise for:
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
                <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                ChainWise shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days&apos; notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Information</h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have any questions about these Terms of Service, please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
