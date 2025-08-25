import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">Terms of Service</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-black">1. Acceptance of Terms</h2>
              <p className="text-black mb-6">
                By accessing and using the Senior Discounts Near You platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">2. Service Description</h2>
              <p className="text-black mb-6">
                Senior Discounts Near You is a platform that connects seniors with local businesses offering discounts and special offers. We provide a directory service and do not directly sell or provide the discounts ourselves.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">3. User Responsibilities</h2>
              <ul className="text-black mb-6 list-disc pl-6 space-y-2">
                <li>You must be at least 50 years old to use this service</li>
                <li>You are responsible for verifying discount details with businesses</li>
                <li>You must comply with all applicable laws and regulations</li>
                <li>You agree not to misuse or abuse the platform</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 text-black">4. Business Submissions</h2>
              <p className="text-black mb-6">
                Businesses submitting discounts must be legitimate and authorized to offer the discounts listed. All submissions are reviewed before publication to ensure accuracy and legitimacy.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">5. Accuracy of Information</h2>
              <p className="text-black mb-6">
                While we strive to maintain accurate and up-to-date information, we cannot guarantee the accuracy of all discount details. Users should verify information directly with businesses.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">6. Limitation of Liability</h2>
              <p className="text-black mb-6">
                Senior Discounts Near You is not liable for any damages arising from the use of this service or the accuracy of discount information provided.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">7. Changes to Terms</h2>
              <p className="text-black mb-6">
                We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.
              </p>

              <h2 className="text-2xl font-bold mb-4 text-black">8. Contact Information</h2>
              <p className="text-black mb-6">
                If you have any questions about these terms, please contact us through our contact page.
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
