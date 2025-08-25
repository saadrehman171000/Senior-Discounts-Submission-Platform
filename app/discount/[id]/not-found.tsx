import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, Home } from "lucide-react"

export default function DiscountNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-3xl font-bold text-black mb-4">
                Discount Not Found
              </h1>
              <p className="text-slate-600 mb-6 leading-relaxed">
                The discount you're looking for doesn't exist or may have been removed. 
                It could have expired, been taken down, or the link might be incorrect.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Home className="h-4 w-4 mr-2" />
                    Browse All Discounts
                  </Button>
                </Link>
                <Link href="/submit">
                  <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Search className="h-4 w-4 mr-2" />
                    Submit a Discount
                  </Button>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Looking for something specific? Try searching by category or ZIP code on our main page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
