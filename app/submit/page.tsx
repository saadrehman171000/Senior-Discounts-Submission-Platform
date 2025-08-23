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
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to search
            </Link>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Submit a Senior Discount</h1>
            <p className="text-slate-700 dark:text-slate-300 leading-7 max-w-2xl">
              Help seniors in your community save money by listing your business discount. All submissions are reviewed
              before being published.
            </p>
          </div>

          <OwnerSubmitForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
