"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Search } from "lucide-react"
import { categories, ageOptions } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  onSearch: (filters: { zip: string; category: string; age: string }) => void
  initialFilters?: { zip: string; category: string; age: string }
  isLoading?: boolean
}

export function FilterBar({ onSearch, initialFilters, isLoading }: FilterBarProps) {
  const [zip, setZip] = useState(initialFilters?.zip || "")
  const [category, setCategory] = useState(initialFilters?.category || "all")
  const [age, setAge] = useState(initialFilters?.age || "any")
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ zip, category, age })
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-amber-50/40 to-white dark:from-slate-900/40 dark:to-slate-900 pb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="md:hidden">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="font-medium">Search Filters</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </CardHeader>

      <CardContent className="pt-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="md:block">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  type="text"
                  placeholder="12345"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  maxLength={5}
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category" className="rounded-lg">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="age">Minimum Age</Label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger id="age" className="rounded-lg">
                    <SelectValue placeholder="Any age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any age</SelectItem>
                    {ageOptions.map((ageOption) => (
                      <SelectItem key={ageOption} value={ageOption}>
                        {ageOption}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full md:w-auto rounded-lg">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CollapsibleContent>
        </Collapsible>

        {/* Desktop version - always visible */}
        <div className="hidden md:block">
          <form onSubmit={handleSubmit} className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label htmlFor="zip-desktop">ZIP Code</Label>
              <Input
                id="zip-desktop"
                type="text"
                placeholder="12345"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                maxLength={5}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="category-desktop">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category-desktop" className="rounded-lg">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="age-desktop">Minimum Age</Label>
              <Select value={age} onValueChange={setAge}>
                <SelectTrigger id="age-desktop" className="rounded-lg">
                  <SelectValue placeholder="Any age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any age</SelectItem>
                  {ageOptions.map((ageOption) => (
                    <SelectItem key={ageOption} value={ageOption}>
                      {ageOption}+
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={isLoading} className="rounded-lg">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
