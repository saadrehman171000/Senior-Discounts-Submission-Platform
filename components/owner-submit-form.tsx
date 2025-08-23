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
import { Eye, Check } from "lucide-react"

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
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
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
  }, [setValue])

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
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken: "dummy-token", // In real app, get from reCAPTCHA
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit discount")
      }

      toast({
        title: "Success!",
        description: "Your discount has been submitted for review.",
      })

      // Clear draft and reset form
      sessionStorage.removeItem(STORAGE_KEY)
      reset()
      setShowPreview(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit discount. Please try again.",
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business">Business Name *</Label>
                <Input
                  id="business"
                  {...register("business")}
                  className="rounded-lg"
                  placeholder="Your Business Name"
                />
                {errors.business && <p className="text-sm text-destructive">{errors.business.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger id="category" className="rounded-lg">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Discount Amount *</Label>
                <Input
                  id="amount"
                  {...register("amount")}
                  className="rounded-lg"
                  placeholder="e.g., 10% off, $5 off, Buy one get one free"
                />
                <p className="text-sm text-muted-foreground">Describe the discount clearly</p>
                {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="minAge">Minimum Age *</Label>
                <Select onValueChange={(value) => setValue("minAge", value as any)}>
                  <SelectTrigger id="minAge" className="rounded-lg">
                    <SelectValue placeholder="Select minimum age" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.minAge && <p className="text-sm text-destructive">{errors.minAge.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days">Valid Days</Label>
                <Input
                  id="days"
                  {...register("days")}
                  className="rounded-lg"
                  placeholder="e.g., Weekdays only, Tuesdays"
                />
                <p className="text-sm text-muted-foreground">When is this discount valid?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Promo Code</Label>
                <Input id="code" {...register("code")} className="rounded-lg" placeholder="e.g., SENIOR10" />
                <p className="text-sm text-muted-foreground">If a code is required</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Date</Label>
                <Input id="start" type="date" {...register("start")} className="rounded-lg" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">End Date</Label>
                <Input id="end" type="date" {...register("end")} className="rounded-lg" />
                {errors.end && <p className="text-sm text-destructive">{errors.end.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Where it applies */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Where it applies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scope">Scope *</Label>
              <Select onValueChange={(value) => setValue("scope", value as any)}>
                <SelectTrigger id="scope" className="rounded-lg">
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
              {errors.scope && <p className="text-sm text-destructive">{errors.scope.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input id="zip" {...register("zip")} className="rounded-lg" placeholder="12345" maxLength={5} />
                <p className="text-sm text-muted-foreground">Primary location ZIP code</p>
                {errors.zip && <p className="text-sm text-destructive">{errors.zip.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Specific Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  className="rounded-lg"
                  placeholder="e.g., Downtown location only"
                />
                <p className="text-sm text-muted-foreground">If applicable</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register("website")}
                  className="rounded-lg"
                  placeholder="https://yourwebsite.com"
                />
                {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register("phone")} className="rounded-lg" placeholder="(555) 123-4567" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Proof URL *</Label>
              <Input
                id="proof"
                type="url"
                {...register("proof")}
                className="rounded-lg"
                placeholder="https://link-to-discount-proof.com"
              />
              <p className="text-sm text-muted-foreground">
                Link to your website, flyer, or other proof of this discount
              </p>
              {errors.proof && <p className="text-sm text-destructive">{errors.proof.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                className="rounded-lg"
                placeholder="Any additional details about this discount..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ownerConfirm"
                  checked={watchedValues.ownerConfirm}
                  onCheckedChange={(checked) => setValue("ownerConfirm", !!checked)}
                />
                <Label htmlFor="ownerConfirm" className="text-sm leading-5">
                  I confirm that I am the owner or authorized representative of this business *
                </Label>
              </div>
              {errors.ownerConfirm && <p className="text-sm text-destructive">{errors.ownerConfirm.message}</p>}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tos"
                  checked={watchedValues.tos}
                  onCheckedChange={(checked) => setValue("tos", !!checked)}
                />
                <Label htmlFor="tos" className="text-sm leading-5">
                  I accept the Terms of Service and Privacy Policy *
                </Label>
              </div>
              {errors.tos && <p className="text-sm text-destructive">{errors.tos.message}</p>}
            </div>

            {/* Honeypot field */}
            <input type="text" {...register("hp")} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} className="rounded-lg">
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>

          <Button type="submit" disabled={!isValid || isSubmitting} className="rounded-lg">
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit Discount
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview */}
      {showPreview && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Preview</CardTitle>
            <p className="text-muted-foreground">This is how your discount will appear to users</p>
          </CardHeader>
          <CardContent>
            <DiscountCard discount={previewDiscount} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
