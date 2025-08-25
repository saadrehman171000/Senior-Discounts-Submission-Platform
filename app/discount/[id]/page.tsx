import { notFound } from 'next/navigation'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Globe, Clock, Calendar, Percent, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

async function getDiscount(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discounts/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching discount:', error)
    return null
  }
}

export default async function DiscountPage({ params }: { params: { id: string } }) {
  const discount = await getDiscount(params.id)
  
  if (!discount) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Discounts
            </Link>
          </div>

          {/* Main Discount Card */}
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl md:text-4xl font-bold text-black mb-2">
                    {discount.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="bg-white text-slate-800 border border-amber-200">
                      {discount.category}
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {discount.minAge}+ Only
                    </Badge>
                    {discount.sponsored && (
                      <Badge variant="default" className="bg-purple-100 text-purple-800">
                        Sponsored
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* See Other Deals Button */}
                <div className="flex flex-col gap-3">
                  <Link href={`/?zip=${discount.zip}`}>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      See Other Deals in {discount.zip}
                    </Button>
                  </Link>
                  <p className="text-sm text-slate-600 text-center">
                    Find more senior discounts in your area
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Discount Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                      <Percent className="h-5 w-5 text-amber-600" />
                      Discount Details
                    </h3>
                    <div className="space-y-3">
                      {discount.sd?.amount && (
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-medium text-black">{discount.sd.amount}</span>
                        </div>
                      )}
                      {discount.sd?.code && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600">Promo Code:</span>
                          <Badge variant="outline" className="font-mono text-sm">
                            {discount.sd.code}
                          </Badge>
                        </div>
                      )}
                      {discount.sd?.days && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
                          <span className="text-sm text-slate-700">{discount.sd.days}</span>
                        </div>
                      )}
                      {discount.sd?.scope && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-600">Scope:</span>
                          <span className="text-sm text-slate-700">{discount.sd.scope}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Validity Period */}
                  {(discount.sd?.start || discount.endDate) && (
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-600" />
                        Validity Period
                      </h4>
                      <div className="space-y-2 text-sm text-slate-700">
                        {discount.sd?.start && (
                          <div>Valid from: {formatDate(discount.sd.start)}</div>
                        )}
                        {discount.endDate && (
                          <div>Valid until: {formatDate(discount.endDate)}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Business Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-600" />
                      Business Information
                    </h3>
                    <div className="space-y-3">
                      {discount.sd?.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{discount.sd.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-700">ZIP Code: {discount.zip}</span>
                      </div>
                      {discount.sd?.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{discount.sd.phone}</span>
                        </div>
                      )}
                      {discount.sd?.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-slate-500" />
                          <a 
                            href={discount.sd.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  {discount.sd?.notes && (
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3">Additional Information</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {discount.sd.notes}
                      </p>
                    </div>
                  )}

                  {/* Proof/Reference */}
                  {discount.sd?.proof && (
                    <div>
                      <h4 className="text-lg font-semibold text-black mb-3">Proof/Reference</h4>
                      <a 
                        href={discount.sd.proof} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        View Proof Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom CTA */}
          <div className="text-center">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-black mb-3">
                  Looking for more senior discounts?
                </h3>
                <p className="text-slate-600 mb-4">
                  Discover other great deals available in your area
                </p>
                <Link href={`/?zip=${discount.zip}`}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    Browse All Deals in {discount.zip}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
