import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ExternalLink, Phone, Star } from "lucide-react"
import { cn } from "@/lib/utils"

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
    proof: string
    phone?: string
    sponsored?: boolean
  }
  className?: string
}

export function DiscountCard({ discount, className }: DiscountCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:ring-2 hover:ring-amber-500/30 bg-white dark:bg-slate-50",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              {discount.sponsored && (
                <>
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 text-xs"
                  >
                    Sponsored
                  </Badge>
                </>
              )}
              <Badge variant="outline" className="text-xs font-medium bg-slate-100 dark:bg-slate-200 text-slate-700 dark:text-slate-800 border-slate-300 dark:border-slate-400">
                {discount.category}
              </Badge>
              <span className="text-sm text-slate-600 dark:text-slate-700 font-medium">
                📍 {discount.zip}
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-800 mb-2">
              {discount.businessName}
            </h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Main discount info */}
          <div className="space-y-3">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-100/50 dark:to-orange-100/50 p-3 rounded-lg border border-amber-200 dark:border-amber-300/50">
              {discount.amount}
            </div>
            
            {/* Additional details in organized layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {discount.days && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-700 font-medium">Valid Days:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-900">{discount.days}</span>
                </div>
              )}
              
              {discount.code && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-700 font-medium">Promo Code:</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-800 bg-amber-100 dark:bg-amber-200 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-400">
                    {discount.code}
                  </span>
                </div>
              )}
              
              {discount.location && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-700 font-medium">Location:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-900">{discount.location}</span>
                </div>
              )}
              
              {(discount.validFrom || discount.validUntil) && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-700 font-medium">Valid:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-900">
                    {discount.validFrom && formatDate(discount.validFrom)}
                    {discount.validFrom && discount.validUntil && " - "}
                    {discount.validUntil && formatDate(discount.validUntil)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-slate-300">
            <Button variant="outline" size="sm" asChild className="rounded-lg bg-white dark:bg-slate-100 hover:bg-slate-50 dark:hover:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-700 dark:text-slate-800 hover:text-slate-900 dark:hover:text-slate-900">
              <a
                href={discount.proof}
                target="_blank"
                rel="noreferrer nofollow noopener"
                className="inline-flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Proof
              </a>
            </Button>

            {discount.website && (
              <Button variant="outline" size="sm" asChild className="rounded-lg bg-white dark:bg-slate-100 hover:bg-slate-50 dark:hover:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-700 dark:text-slate-800 hover:text-slate-900 dark:hover:text-slate-900">
                <a
                  href={discount.website}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  className="inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Website
                </a>
              </Button>
            )}

            {discount.phone && (
              <Button variant="outline" size="sm" asChild className="rounded-lg bg-white dark:bg-slate-100 hover:bg-slate-50 dark:hover:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-700 dark:text-slate-800 hover:text-slate-900 dark:hover:text-slate-900">
                <a href={`tel:${discount.phone}`} className="inline-flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
