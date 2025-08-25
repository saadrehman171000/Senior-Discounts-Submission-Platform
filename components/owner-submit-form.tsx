"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiscountCard } from "@/components/discount-card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

import { OwnerSubmitSchema, type OwnerSubmitData, categories, ageOptions, scopeOptions } from "@/lib/validation"
import { Eye, Check, Loader2 } from "lucide-react"

const STORAGE_KEY = "senior-discounts-draft"

export function OwnerSubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toast } = useToast()
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  const form = useForm<OwnerSubmitData>({
    resolver: zodResolver(OwnerSubmitSchema),
    defaultValues: {
      business: "",
      category: "",
      amount: "",
      minAge: "50",
      scope: "Nationwide",
      zip: "",
      proof: "",
      ownerConfirm: false,
      tos: false,
      days: "",
      code: "",
      location: "",
      website: "",
      phone: "",
      start: "",
      end: "",
      notes: "",
      hp: "",
      recaptchaToken: "disabled",
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    setError,
  } = form
  const watchedValues = watch()



  useEffect(() => {
    const savedDraft = sessionStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        Object.keys(draft).forEach((key) => {
          setValue(key as keyof OwnerSubmitData, draft[key])
        })
      } catch (error) {
        console.error("Failed to restore draft:", error)
      }
    }
    setIsInitialized(true)
  }, [setValue, form])

  const saveDraft = useCallback((values: OwnerSubmitData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values))
    }, 1000)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      saveDraft(watchedValues)
    }
  }, [watchedValues, isInitialized, saveDraft])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const onSubmit = async (data: OwnerSubmitData) => {
    setIsSubmitting(true)

    try {
      // Submit to backend directly
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken: "disabled", // Set a dummy value since reCAPTCHA is disabled
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 409) {
          throw new Error(result.error?.message || "A similar discount has already been submitted today")
        }
        
        if (response.status === 400) {
          if (result.error?.code === 'RECAPTCHA_ERROR') {
            throw new Error("reCAPTCHA verification failed. Please try again.")
          }
          throw new Error(result.error?.message || "Invalid data submitted")
        }
        
        throw new Error(result.error?.message || "Failed to submit discount")
      }

      toast({
        title: "Success!",
        description: "Your discount has been submitted for review. You'll receive an email confirmation shortly.",
      })

      // Clear draft and reset form
      sessionStorage.removeItem(STORAGE_KEY)
      reset()
      setShowPreview(false)
    } catch (error) {
      console.error("Submission error:", error)
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit discount. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToFirstError = useCallback(() => {
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
    }
  }, [errors])

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstError()
    }
  }, [errors, scrollToFirstError])

  const previewDiscount = {
    id: "preview",
    businessName: watchedValues.business || "Your Business",
    category: watchedValues.category || "Category",
    zip: watchedValues.zip || "00000",
    amount: watchedValues.amount || "Discount amount",
    days: watchedValues.days,
    code: watchedValues.code,
    validFrom: watchedValues.start,
    validUntil: watchedValues.end,
    location: watchedValues.location,
    website: watchedValues.website,
    proof: watchedValues.proof || "#",
    phone: watchedValues.phone,
    sponsored: false,
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Discount Details */}
        <Card className="rounded-2xl border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-2xl">
            <CardTitle className="text-2xl font-bold tracking-tight text-black">Discount Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="business" className="text-base font-semibold">Business Name *</Label>
              <Input
                id="business"
                placeholder="Enter your business name"
                value={watchedValues.business}
                onChange={(e) => setValue("business", e.target.value)}
                className={`text-base ${errors.business ? "border-red-500" : ""}`}
              />
              {errors.business && (
                <p className="text-base text-red-500 font-medium">{errors.business.message}</p>
              )}
            </div>

            {/* Category and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                <Select
                  value={watchedValues.category}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger className={`text-base ${errors.category ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-base">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-semibold">Discount Amount *</Label>
                <Input
                  id="amount"
                  placeholder="e.g., 20% off, $5 discount"
                  value={watchedValues.amount}
                  onChange={(e) => setValue("amount", e.target.value)}
                  className={`text-base ${errors.amount ? "border-red-500" : ""}`}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>
            </div>

            {/* Age and Scope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAge" className="text-base font-semibold">Minimum Age *</Label>
                <Select
                  value={watchedValues.minAge}
                  onValueChange={(value) => setValue("minAge", value as "50" | "55" | "60" | "62" | "65")}
                >
                  <SelectTrigger className={`text-base ${errors.minAge ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select minimum age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map((age) => (
                      <SelectItem key={age} value={age} className="text-base">
                        {age}+ years
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.minAge && (
                  <p className="text-sm text-red-500">{errors.minAge.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scope" className="text-base font-semibold">Scope *</Label>
                <Select
                  value={watchedValues.scope}
                  onValueChange={(value) => setValue("scope", value as "Nationwide" | "Specific locations" | "Online only")}
                >
                  <SelectTrigger className={`text-base ${errors.scope ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((scope) => (
                      <SelectItem key={scope} value={scope} className="text-base">
                        {scope}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.scope && (
                  <p className="text-sm text-red-500">{errors.scope.message}</p>
                )}
              </div>
            </div>

            {/* ZIP Code and Proof */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip" className="text-base font-semibold">ZIP Code *</Label>
                <Input
                  id="zip"
                  placeholder="Enter 5-digit ZIP code"
                  value={watchedValues.zip}
                  onChange={(e) => setValue("zip", e.target.value)}
                  className={`text-base ${errors.zip ? "border-red-500" : ""}`}
                />
                {errors.zip && (
                  <p className="text-sm text-red-500">{errors.zip.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof" className="text-base font-semibold">Proof URL *</Label>
                <Input
                  id="proof"
                  placeholder="https://example.com/discount-proof"
                  value={watchedValues.proof}
                  onChange={(e) => setValue("proof", e.target.value)}
                  className={`text-base ${errors.proof ? "border-red-500" : ""}`}
                />
                {errors.proof && (
                  <p className="text-sm text-red-500">{errors.proof.message}</p>
                )}
              </div>
            </div>

            {/* Hidden honeypot field */}
            <input
              type="text"
              {...register("hp")}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="rounded-2xl border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-2xl">
            <CardTitle className="text-2xl font-bold tracking-tight text-black">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Days and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days" className="text-base font-semibold">Valid Days</Label>
                <Input
                  id="days"
                  placeholder="e.g., Monday-Friday, Weekends only"
                  value={watchedValues.days || ""}
                  onChange={(e) => setValue("days", e.target.value)}
                  className="text-base"
                />
                {errors.days && (
                  <p className="text-base text-red-500 font-medium">{errors.days.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-base font-semibold">Promo Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SENIOR20, GOLDEN"
                  value={watchedValues.code || ""}
                  onChange={(e) => setValue("code", e.target.value)}
                  className="text-base"
                />
                {errors.code && (
                  <p className="text-base text-red-500 font-medium">{errors.code.message}</p>
                )}
              </div>
            </div>

            {/* Location and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-semibold">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Downtown location, Main Street"
                  value={watchedValues.location || ""}
                  onChange={(e) => setValue("location", e.target.value)}
                  className="text-base"
                />
                {errors.location && (
                  <p className="text-base text-red-500 font-medium">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-base font-semibold">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourbusiness.com"
                  {...register("website")}
                  className="text-base"
                />
                {errors.website && (
                  <p className="text-base text-red-500 font-medium">{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Phone and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., (555) 123-4567"
                  {...register("phone")}
                  className="text-base"
                />
                {errors.phone && (
                  <p className="text-base text-red-500 font-medium">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start" className="text-base font-semibold text-black">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  {...register("start")}
                  className="text-base border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                {errors.start && (
                  <p className="text-base text-red-500 font-medium">{errors.start.message}</p>
                )}
              </div>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end" className="text-base font-semibold text-black">End Date</Label>
              <Input
                id="end"
                type="date"
                {...register("end")}
                className="text-base border-2 border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {errors.end && (
                <p className="text-base text-red-500 font-medium">{errors.end.message}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about the discount..."
                {...register("notes")}
                rows={3}
                className="text-base"
              />
              {errors.notes && (
                <p className="text-base text-red-500 font-medium">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="rounded-2xl border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-2xl">
            <CardTitle className="text-2xl font-bold tracking-tight text-black">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="ownerConfirm"
                checked={watchedValues.ownerConfirm}
                onCheckedChange={(checked) => setValue("ownerConfirm", checked as boolean)}
                className={`w-6 h-6 border-3 border-slate-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 ${errors.ownerConfirm ? "border-red-500" : ""}`}
              />
              <div className="space-y-2">
                <Label htmlFor="ownerConfirm" className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black">
                  I confirm that I am the business owner or authorized representative
                </Label>
                {errors.ownerConfirm && (
                  <p className="text-base text-red-500 font-medium">{errors.ownerConfirm.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Checkbox
                id="tos"
                checked={watchedValues.tos}
                onCheckedChange={(checked) => setValue("tos", checked as boolean)}
                className={`w-6 h-6 border-3 border-slate-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 ${errors.tos ? "border-red-500" : ""}`}
              />
              <div className="space-y-2">
                <Label htmlFor="tos" className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black">
                  I accept the{" "}
                  <Link href="/terms" className="text-amber-600 hover:text-amber-700 underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-amber-600 hover:text-amber-700 underline">
                    privacy policy
                  </Link>
                </Label>
                {errors.tos && (
                  <p className="text-base text-red-500 font-medium">{errors.tos.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>





        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2 text-lg">Form Validation Errors:</h4>
            <ul className="text-base text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {field}: {error?.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 h-12 text-base font-medium border-2 hover:border-slate-300 dark:hover:border-slate-600"
          >
            <Eye className="w-5 h-5 mr-2" />
            {showPreview ? "Hide Preview" : "Preview Discount"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              console.log('Current form values:', form.getValues())
              console.log('Current errors:', errors)
              const result = await form.trigger()
              console.log('Validation result:', result)
            }}
            className="flex-1 h-12 text-base font-medium border-2 hover:border-slate-300 dark:hover:border-slate-600"
          >
            Test Validation
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Submit Discount
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <div className="space-y-6 pt-8 border-t border-slate-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-black mb-2">Preview Your Discount</h3>
            <p className="text-black">This is how your discount will appear to users</p>
          </div>
          <div className="max-w-md mx-auto">
            <DiscountCard discount={previewDiscount} />
          </div>
        </div>
      )}
    </div>
  )
}
