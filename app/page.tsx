"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FilterBar } from "@/components/filter-bar"
import { DiscountCard } from "@/components/discount-card"
import { DiscountCardSkeleton } from "@/components/discount-card-skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFilters] = useState(() => ({
    zip: searchParams.get("zip") || "",
    category: searchParams.get("category") || "",
    age: searchParams.get("age") || "",
  }))

  const [currentPage, setCurrentPage] = useState(() => Number.parseInt(searchParams.get("page") || "1"))

  const queryString = new URLSearchParams({
    ...filters,
    page: currentPage.toString(),
  }).toString()

  const { data, error, isLoading } = useSWR(`/api/discounts?${queryString}`, fetcher)

  const handleSearch = useCallback(
    (newFilters: typeof filters) => {
      setFilters(newFilters)
      setCurrentPage(1)

      const params = new URLSearchParams(newFilters)
      params.set("page", "1")
      router.push(`/?${params.toString()}`)
    },
    [router],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)

      const params = new URLSearchParams(filters)
      params.set("page", page.toString())
      router.push(`/?${params.toString()}`)

      // Focus management
      const resultsHeading = document.getElementById("results-heading")
      if (resultsHeading) {
        resultsHeading.focus()
      }
    },
    [filters, router],
  )

  useEffect(() => {
    const urlZip = searchParams.get("zip") || ""
    const urlCategory = searchParams.get("category") || ""
    const urlAge = searchParams.get("age") || ""
    const urlPage = Number.parseInt(searchParams.get("page") || "1")

    // Only update if values actually changed
    if (
      urlZip !== filters.zip ||
      urlCategory !== filters.category ||
      urlAge !== filters.age ||
      urlPage !== currentPage
    ) {
      setFilters({ zip: urlZip, category: urlCategory, age: urlAge })
      setCurrentPage(urlPage)
    }
  }, [searchParams.toString()]) // Use toString() to create stable dependency

  const discounts = data?.discounts || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.totalCount || 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 via-orange-50/30 to-yellow-100/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-800 leading-tight">
              Senior Discounts Near You
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto mb-10 font-medium">
              Discover verified senior discounts and special offers in your area. Save money on dining, shopping,
              services, and more.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-700 rounded-full text-base font-semibold shadow-lg">
              <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></span>
              Updated daily with new offers
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="filter-section py-12 border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FilterBar onSearch={handleSearch} initialFilters={filters} isLoading={isLoading} />
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12 bg-gradient-to-b from-background to-amber-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div id="results-heading" tabIndex={-1} className="mb-8 focus:outline-none">
              <h2 className="text-3xl font-bold tracking-tight mb-3 text-slate-800">Search Results</h2>
              <div aria-live="polite" className="text-lg text-slate-600 font-medium">
                {isLoading
                  ? "Searching for the best discounts..."
                  : error
                    ? "Error loading results. Please try again."
                    : `${totalCount} discount${totalCount !== 1 ? "s" : ""} found`}
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DiscountCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-amber-100">
                <div className="text-6xl mb-6">⚠️</div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">Something went wrong</h3>
                <p className="text-slate-600 mb-6 text-lg">We couldn't load the discounts right now.</p>
                <Button onClick={() => window.location.reload()} size="lg" className="rounded-full">
                  Try Again
                </Button>
              </div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-amber-100">
                <div className="text-8xl mb-6">🔍</div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-800">No discounts found</h3>
                <p className="text-slate-600 text-lg max-w-md mx-auto">
                  Try adjusting your search criteria or check back later for new discounts in your area.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {discounts.map((discount: any) => (
                    <div key={discount.id} className="card-hover">
                      <DiscountCard discount={discount} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-sm">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="rounded-full border-amber-200 hover:bg-amber-50"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="lg"
                            onClick={() => handlePageChange(page)}
                            className={`rounded-full w-12 h-12 ${
                              currentPage === page
                                ? "bg-primary hover:bg-primary/90"
                                : "border-amber-200 hover:bg-amber-50"
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="rounded-full border-amber-200 hover:bg-amber-50"
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
