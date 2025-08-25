import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MapPin, Phone, Globe, Clock, Calendar, Percent, ExternalLink } from "lucide-react"
import Link from "next/link"

interface DiscountCardProps {
  discount: {
    id: string
    businessName: string
    category: string
    zip: string
    amount: string
    days?: string
    code?: string
    validFrom?: string
    validUntil?: string
    location?: string
    website?: string
    proof?: string
    phone?: string
    sponsored?: boolean
  }
}

export function DiscountCard({ discount }: DiscountCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className={`
      "rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:ring-2 hover:ring-amber-500/30 bg-white dark:bg-slate-50",
      ${discount.sponsored ? 'ring-2 ring-purple-500/30 border-purple-200' : ''}
    `}>
      <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link href={`/discount/${discount.id}`} className="group">
              <h3 className="text-xl font-bold text-black group-hover:text-amber-700 transition-colors cursor-pointer">
                {discount.businessName}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-white text-slate-800 border border-amber-200 text-xs">
                {discount.category}
              </Badge>
              {discount.sponsored && (
                <Badge variant="default" className="bg-purple-100 text-purple-800 text-xs">
                  Sponsored
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Discount Amount */}
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-amber-600" />
            <span className="text-lg font-semibold text-black">{discount.amount}</span>
          </div>

          {/* Promo Code */}
          {discount.code && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Code:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {discount.code}
              </Badge>
            </div>
          )}

          {/* Valid Days */}
          {discount.days && (
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
              <span className="text-sm text-slate-700">{discount.days}</span>
            </div>
          )}

          {/* Validity Period */}
          {(discount.validFrom || discount.validUntil) && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div className="text-sm text-slate-700">
                {discount.validFrom && (
                  <div>From: {formatDate(discount.validFrom)}</div>
                )}
                {discount.validUntil && (
                  <div>Until: {formatDate(discount.validUntil)}</div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-700">
              {discount.location && `${discount.location}, `}
              ZIP: {discount.zip}
            </span>
          </div>

          {/* Contact Information */}
          <div className="flex flex-wrap gap-3 pt-2">
            {discount.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-600">{discount.phone}</span>
              </div>
            )}
            {discount.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-3 w-3 text-slate-500" />
                <a 
                  href={discount.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <Link href={`/discount/${discount.id}`}>
            <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
              <ExternalLink className="h-3 w-3 mr-2" />
              View Full Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
