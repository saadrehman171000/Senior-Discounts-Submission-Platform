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
import type { DiscountsListResponse } from "@/lib/validation"

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

  const { data, error, isLoading } = useSWR<DiscountsListResponse>(`/api/discounts?${queryString}`, fetcher)

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

  const discounts = data?.items || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.total || 0

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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6 rounded-2xl">
                <a href="/submit">Submit Your Discount</a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 rounded-2xl">
                <a href="#search">Search Discounts</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section id="search" className="py-12 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                Find Senior Discounts
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Search by location, category, or age requirement
              </p>
            </div>
            <FilterBar onSearch={handleSearch} initialFilters={filters} />
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 id="results-heading" className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Available Discounts
                </h2>
                {totalCount > 0 && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {totalCount} discount{totalCount !== 1 ? "s" : ""} found
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DiscountCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-4">Failed to load discounts</div>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && (
              <>
                {discounts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-slate-500 text-lg mb-4">No discounts found</div>
                    <p className="text-slate-400 mb-6">
                      Try adjusting your search criteria or{" "}
                      <a href="/submit" className="text-amber-600 hover:text-amber-700 underline">
                        submit a new discount
                      </a>
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {discounts.map((discount) => (
                        <DiscountCard
                          key={discount.id}
                          discount={{
                            id: discount.id,
                            businessName: discount.businessName,
                            category: discount.category,
                            zip: discount.zip,
                            amount: discount.amount,
                            days: discount.days,
                            code: discount.code,
                            validFrom: discount.startDate,
                            validUntil: discount.endDate,
                            location: discount.location,
                            website: discount.website,
                            proof: discount.proof,
                            phone: discount.phone,
                            sponsored: discount.sponsored,
                          }}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-12">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-10 h-10"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Have a Senior Discount to Share?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Help other seniors save money by submitting your business discount. It only takes a few minutes!
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 rounded-2xl">
              <a href="/submit">Submit Your Discount</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
