import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - ChainWise',
  description: 'Privacy policy for ChainWise AI-powered cryptocurrency advisory platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              ChainWise collects information to provide and improve our services. We collect information in the following ways:
            </p>

            <h3 className="text-xl font-medium mb-2">Information You Provide</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>Account information (email, name, profile details)</li>
              <li>Portfolio data you choose to track</li>
              <li>Preferences and settings</li>
              <li>Communications with our support team</li>
            </ul>

            <h3 className="text-xl font-medium mb-2">Information We Collect Automatically</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Provide and maintain our services</li>
              <li>Personalize your experience and AI insights</li>
              <li>Process transactions and manage subscriptions</li>
              <li>Send important notifications and updates</li>
              <li>Improve our services and develop new features</li>
              <li>Ensure security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="mb-4">
              We do not sell, rent, or trade your personal information. We may share information in the following limited circumstances:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our service</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
              <li><strong>Consent:</strong> When you explicitly agree to sharing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication</li>
              <li>Secure hosting infrastructure</li>
            </ul>
            <p className="mb-4">
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="mb-4">
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
            <p className="mb-4">Our service integrates with third-party providers:</p>
            <ul className="list-disc ml-6 mb-4">
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Vercel:</strong> Hosting and deployment</li>
              <li><strong>CoinGecko:</strong> Cryptocurrency market data</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>OpenAI:</strong> AI-powered insights</li>
            </ul>
            <p className="mb-4">
              These services have their own privacy policies that govern their use of your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
              <li>Restrict processing of your information</li>
            </ul>
            <p className="mb-4">
              To exercise these rights, please contact us at privacy@chainwise.tech
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
            <p className="mb-4">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete your personal information within 30 days, except where retention is required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p className="mb-4">
              ChainWise operates globally and may transfer your information to countries outside your residence. We ensure appropriate safeguards are in place to protect your information during such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="mb-4">
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any material changes via email or through our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Email: privacy@chainwise.tech</li>
              <li>Support: support@chainwise.tech</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}