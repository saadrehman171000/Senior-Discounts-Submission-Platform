import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OwnerSubmitForm } from "@/components/owner-submit-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function SubmitPage() {
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
              Back to search
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black">
                Submit a Senior Discount
              </h1>
              <p className="text-black leading-7 max-w-2xl mx-auto font-bold text-lg">
                Help seniors in your community save money by listing your business discount. All submissions are reviewed
                before being published.
              </p>
            </div>
          </div>

          <OwnerSubmitForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
