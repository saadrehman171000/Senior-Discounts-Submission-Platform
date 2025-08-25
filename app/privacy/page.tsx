import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">Privacy Policy</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">1. Information We Collect</h2>
              <p className="text-black mb-6">
                We collect information you provide directly to us, such as when you submit a discount, contact us, or use our services.
              </p>

              <h3 className="text-xl font-semibold mb-3 text-black">Information from Business Submissions:</h3>
              <ul className="text-black mb-6 list-disc pl-6 space-y-2">
                <li>Business name and contact information</li>
                <li>Discount details and terms</li>
                <li>Proof of discount availability</li>
                <li>IP address for spam prevention</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 text-black">2. How We Use Your Information</h2>
              <p className="text-black mb-6">
                We use the information we collect to:
              </p>
              <ul className="text-black mb-6 list-disc pl-6 space-y-2">
                <li>Provide and maintain our discount directory service</li>
                <li>Review and verify business submissions</li>
                <li>Send notifications about discount status</li>
                <li>Prevent spam and abuse</li>
                <li>Improve our services</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 text-black">3. Information Sharing</h2>
              <p className="text-black mb-6">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except:
              </p>
              <ul className="text-black mb-6 list-disc pl-6 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>To prevent fraud or abuse</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 text-black">4. Data Security</h2>
              <p className="text-black mb-6">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">5. Data Retention</h2>
              <p className="text-black mb-6">
                We retain your information for as long as necessary to provide our services and comply with legal obligations. Expired discounts are automatically moved to trash status.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">6. Your Rights</h2>
              <p className="text-black mb-6">
                You have the right to:
              </p>
              <ul className="text-black mb-6 list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of certain communications</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 text-black">7. Cookies and Tracking</h2>
              <p className="text-black mb-6">
                We use cookies and similar technologies to improve user experience and prevent spam. You can control cookie settings through your browser preferences.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">8. Third-Party Services</h2>
              <p className="text-black mb-6">
                Our service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">9. Changes to This Policy</h2>
              <p className="text-black mb-6">
                We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">10. Contact Us</h2>
              <p className="text-black mb-6">
                If you have questions about this privacy policy or our data practices, please contact us through our contact page.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
