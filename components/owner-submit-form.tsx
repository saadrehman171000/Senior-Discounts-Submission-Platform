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

  // Debug form validation
  useEffect(() => {
    console.log('Form errors:', errors)
    console.log('Form isValid:', isValid)
    console.log('Form values:', watchedValues)
    console.log('Form state:', form.getValues())
  }, [errors, isValid, watchedValues, form])

  useEffect(() => {
    const savedDraft = sessionStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        console.log('Restoring draft:', draft)
        Object.keys(draft).forEach((key) => {
          setValue(key as keyof OwnerSubmitData, draft[key])
        })
      } catch (error) {
        console.error("Failed to restore draft:", error)
      }
    }
    setIsInitialized(true)
    console.log('Form initialized with values:', form.getValues())
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
    console.log('Form submission data:', data)
    console.log('Form errors before submission:', errors)
    
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
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Discount Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="business">Business Name *</Label>
              <Input
                id="business"
                placeholder="Enter your business name"
                value={watchedValues.business}
                onChange={(e) => setValue("business", e.target.value)}
                className={errors.business ? "border-red-500" : ""}
              />
              {errors.business && (
                <p className="text-sm text-red-500">{errors.business.message}</p>
              )}
            </div>

            {/* Category and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={watchedValues.category}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
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
                <Label htmlFor="amount">Discount Amount *</Label>
                <Input
                  id="amount"
                  placeholder="e.g., 20% off, $5 discount"
                  value={watchedValues.amount}
                  onChange={(e) => setValue("amount", e.target.value)}
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>
            </div>

            {/* Age and Scope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAge">Minimum Age *</Label>
                <Select
                  value={watchedValues.minAge}
                  onValueChange={(value) => setValue("minAge", value as "50" | "55" | "60" | "62" | "65")}
                >
                  <SelectTrigger className={errors.minAge ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select minimum age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map((age) => (
                      <SelectItem key={age} value={age}>
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
                <Label htmlFor="scope">Scope *</Label>
                <Select
                  value={watchedValues.scope}
                  onValueChange={(value) => setValue("scope", value as "Nationwide" | "Specific locations" | "Online only")}
                >
                  <SelectTrigger className={errors.scope ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((scope) => (
                      <SelectItem key={scope} value={scope}>
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
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  placeholder="Enter 5-digit ZIP code"
                  value={watchedValues.zip}
                  onChange={(e) => setValue("zip", e.target.value)}
                  className={errors.zip ? "border-red-500" : ""}
                />
                {errors.zip && (
                  <p className="text-sm text-red-500">{errors.zip.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="proof">Proof URL *</Label>
                <Input
                  id="proof"
                  placeholder="https://example.com/discount-proof"
                  value={watchedValues.proof}
                  onChange={(e) => setValue("proof", e.target.value)}
                  className={errors.proof ? "border-red-500" : ""}
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
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Days and Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days">Valid Days</Label>
                <Input
                  id="days"
                  placeholder="e.g., Monday-Friday, Weekends only"
                  value={watchedValues.days || ""}
                  onChange={(e) => setValue("days", e.target.value)}
                />
                {errors.days && (
                  <p className="text-sm text-red-500">{errors.days.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SENIOR20, GOLDEN"
                  value={watchedValues.code || ""}
                  onChange={(e) => setValue("code", e.target.value)}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>
            </div>

            {/* Location and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Downtown location, Main Street"
                  value={watchedValues.location || ""}
                  onChange={(e) => setValue("location", e.target.value)}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://yourbusiness.com"
                  {...register("website")}
                />
                {errors.website && (
                  <p className="text-sm text-red-500">{errors.website.message}</p>
                )}
              </div>
            </div>

            {/* Phone and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., (555) 123-4567"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  {...register("start")}
                />
                {errors.start && (
                  <p className="text-sm text-red-500">{errors.start.message}</p>
                )}
              </div>
            </div>

            {/* End Date and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  {...register("end")}
                />
                {errors.end && (
                  <p className="text-sm text-red-500">{errors.end.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the discount..."
                  {...register("notes")}
                  rows={3}
                />
                {errors.notes && (
                  <p className="text-sm text-red-500">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="ownerConfirm"
                checked={watchedValues.ownerConfirm}
                onCheckedChange={(checked) => setValue("ownerConfirm", checked as boolean)}
                className={errors.ownerConfirm ? "border-red-500" : ""}
              />
              <div className="space-y-1">
                <Label htmlFor="ownerConfirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I confirm that I am the business owner or authorized representative
                </Label>
                {errors.ownerConfirm && (
                  <p className="text-sm text-red-500">{errors.ownerConfirm.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="tos"
                checked={watchedValues.tos}
                onCheckedChange={(checked) => setValue("tos", checked as boolean)}
                className={errors.tos ? "border-red-500" : ""}
              />
              <div className="space-y-1">
                <Label htmlFor="tos" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I accept the terms of service and privacy policy
                </Label>
                {errors.tos && (
                  <p className="text-sm text-red-500">{errors.tos.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Form Validation Debug */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Form Debug Info:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Business: "{watchedValues.business}" (Length: {watchedValues.business?.length || 0})</p>
            <p>Amount: "{watchedValues.amount}" (Length: {watchedValues.amount?.length || 0})</p>
            <p>ZIP: "{watchedValues.zip}" (Length: {watchedValues.zip?.length || 0})</p>
            <p>Proof: "{watchedValues.proof}" (Length: {watchedValues.proof?.length || 0})</p>
            <p>Category: "{watchedValues.category}"</p>
            <p>Min Age: "{watchedValues.minAge}"</p>
            <p>Scope: "{watchedValues.scope}"</p>
            <p>Owner Confirm: {watchedValues.ownerConfirm ? 'Yes' : 'No'}</p>
            <p>Terms: {watchedValues.tos ? 'Yes' : 'No'}</p>
          </div>
          <div className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={async () => {
                const result = await form.trigger()
                console.log('Manual validation result:', result)
                console.log('Current errors:', errors)
                console.log('Form values:', form.getValues())
              }}
            >
              Debug: Trigger Validation
            </Button>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Form Validation Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>• {field}: {error?.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
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
            className="flex-1"
          >
            Test Validation
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Submit Discount
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Preview</h3>
          <DiscountCard discount={previewDiscount} />
        </div>
      )}
    </div>
  )
}
