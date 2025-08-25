"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DiscountCard } from "@/components/discount-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Eye, Check, X, LogOut, Clock, AlertTriangle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [denyReason, setDenyReason] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/discounts?status=${statusFilter}&page=${currentPage}`,
    fetcher,
  )



  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/discounts/${id}/approve`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to approve")

      toast({
        title: "Success",
        description: "Discount approved successfully.",
      })

      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve discount.",
        variant: "destructive",
      })
    }
  }

  const handleDeny = async (id: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/discounts/${id}/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) throw new Error("Failed to deny")

      toast({
        title: "Success",
        description: "Discount denied successfully.",
      })

      mutate()
      setDenyReason("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny discount.",
        variant: "destructive",
      })
    }
  }

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedDiscounts.map((id) => fetch(`/api/admin/discounts/${id}/approve`, { method: "POST" })))

      toast({
        title: "Success",
        description: `${selectedDiscounts.length} discounts approved.`,
      })

      setSelectedDiscounts([])
      mutate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve some discounts.",
        variant: "destructive",
      })
    }
  }

  const discounts = data?.items || []
  const totalPages = data?.totalPages || 1

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Moderator Dashboard</h1>
            <p className="text-slate-700 dark:text-slate-300 leading-7">Review and manage discount submissions</p>
            
            {/* Auto-cleanup Info */}
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Automatic Cleanup Active</span>
              </div>
              <p className="text-amber-700 dark:text-amber-300 mt-1 text-sm">
                Expired discounts are automatically moved to TRASH status to keep the list clean and current.
              </p>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedDiscounts.length > 0 && (
                <Button onClick={handleBulkApprove} className="rounded-lg">
                  Approve Selected ({selectedDiscounts.length})
                </Button>
              )}
              <Button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/cleanup-expired', { method: 'POST' })
                    if (response.ok) {
                      toast({
                        title: "Cleanup Complete",
                        description: "Expired discounts have been moved to TRASH",
                      })
                      // Refresh the data
                      mutate()
                    }
                  } catch (error) {
                    toast({
                      title: "Cleanup Failed",
                      description: "Failed to cleanup expired discounts",
                      variant: "destructive",
                    })
                  }
                }} 
                variant="outline" 
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Manual Cleanup
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDiscounts(discounts.map((d: any) => d.id))
                        } else {
                          setSelectedDiscounts([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>ZIP</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Min Age</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Sponsored</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount: any) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedDiscounts.includes(discount.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDiscounts([...selectedDiscounts, discount.id])
                          } else {
                            setSelectedDiscounts(selectedDiscounts.filter((id) => id !== discount.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{discount.title}</TableCell>
                    <TableCell>{discount.zip}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {discount.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{discount.minAge}+</TableCell>
                    <TableCell>
                      {discount.endDate ? (
                        <div className="flex items-center gap-2">
                          <span>{formatDate(discount.endDate)}</span>
                          {new Date(discount.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
                           new Date(discount.endDate) > new Date() && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires Soon
                            </Badge>
                          )}
                        </div>
                      ) : (
                        "No end date"
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.sponsored ? (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          Yes
                        </Badge>
                      ) : (
                        "No"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(discount.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Discount Details</DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <DiscountCard discount={{
                                id: discount.id,
                                businessName: discount.title,
                                category: discount.category,
                                zip: discount.zip,
                                amount: discount.sd?.amount || 'N/A',
                                days: discount.sd?.days,
                                code: discount.sd?.code,
                                validFrom: discount.sd?.start,
                                validUntil: discount.endDate,
                                location: discount.sd?.location,
                                website: discount.sd?.website,
                                proof: discount.sd?.proof,
                                phone: discount.sd?.phone,
                                sponsored: discount.sponsored,
                              }} />
                            </div>
                          </DialogContent>
                        </Dialog>

                        {statusFilter === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(discount.id)}
                              className="rounded-lg text-emerald-600 hover:text-emerald-700"
                            >
                              <Check className="h-3 w-3" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-lg text-rose-600 hover:text-rose-700 bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deny Discount</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Please provide a reason for denying this discount submission.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Textarea
                                  placeholder="Reason for denial..."
                                  value={denyReason}
                                  onChange={(e) => setDenyReason(e.target.value)}
                                  className="rounded-lg"
                                />
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDenyReason("")}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeny(discount.id, denyReason)}
                                    disabled={!denyReason.trim()}
                                    className="bg-rose-600 hover:bg-rose-700"
                                  >
                                    Deny Discount
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {discounts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">No discounts found</h3>
              <p className="text-muted-foreground">No discounts match the current filter criteria.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg"
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="rounded-lg w-10"
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
