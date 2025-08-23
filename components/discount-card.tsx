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
        "rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:ring-1 hover:ring-amber-500/20",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
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
              <Badge variant="outline" className="text-xs">
                {discount.category}
              </Badge>
              <span className="text-sm text-muted-foreground">{discount.zip}</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight leading-tight">{discount.businessName}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Description line */}
          <div className="text-slate-700 dark:text-slate-300 leading-7">
            <span className="font-medium">{discount.amount}</span>
            {discount.days && <span> • {discount.days}</span>}
            {discount.code && <span> • Code: {discount.code}</span>}
          </div>

          {/* Meta row */}
          <div className="text-sm text-muted-foreground space-y-1">
            {(discount.validFrom || discount.validUntil) && (
              <div>
                {discount.validFrom && `Valid from ${formatDate(discount.validFrom)}`}
                {discount.validFrom && discount.validUntil && " - "}
                {discount.validUntil && `until ${formatDate(discount.validUntil)}`}
              </div>
            )}
            {discount.location && <div>{discount.location}</div>}
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="rounded-lg bg-transparent">
              <a
                href={discount.proof}
                target="_blank"
                rel="noreferrer nofollow noopener"
                className="inline-flex items-center"
              >
                Proof
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>

            {discount.website && (
              <Button variant="outline" size="sm" asChild className="rounded-lg bg-transparent">
                <a
                  href={discount.website}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  className="inline-flex items-center"
                >
                  Website
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}

            {discount.phone && (
              <Button variant="outline" size="sm" asChild className="rounded-lg bg-transparent">
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
