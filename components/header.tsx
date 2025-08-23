import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Percent } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-500 rounded-lg group-hover:bg-amber-600 transition-colors">
              <Percent className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-amber-50">Senior Discounts</h1>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Near You</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
            >
              Free to Submit
            </Badge>
            <Button asChild variant="outline" size="sm" className="text-slate-600 hover:text-slate-800">
              <Link href="/login">Admin</Link>
            </Button>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-6">
              <Link href="/submit">Submit a Discount</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
