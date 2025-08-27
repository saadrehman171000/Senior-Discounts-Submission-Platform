"use client"

import { useState, useEffect } from "react"
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
import { Eye, Check, X, LogOut, Clock, AlertTriangle, Zap } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([])
  const [denyReason, setDenyReason] = useState("")
  const [autoApprovalInfo, setAutoApprovalInfo] = useState<{
    pendingReady: number
    lastAutoApproval: string | null
  }>({ pendingReady: 0, lastAutoApproval: null })
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
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

  const handleAutoApprove = async () => {
    try {
      const response = await fetch('/api/admin/auto-approve', { method: 'POST' })
      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Auto-Approval Complete",
          description: `${result.approved} discounts have been automatically approved`,
        })
        // Refresh the data
        mutate()
        // Update auto-approval info
        setAutoApprovalInfo(prev => ({
          ...prev,
          lastAutoApproval: new Date().toISOString(),
          pendingReady: 0
        }))
      }
    } catch (error) {
      toast({
        title: "Auto-Approval Failed",
        description: "Failed to trigger auto-approval",
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
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-black">Moderator Dashboard</h1>
            <p className="text-black leading-7 font-medium">Review and manage discount submissions</p>
            
            {/* Auto-Approval System Info */}
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-black">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Automatic Approval System Active</span>
              </div>
              <p className="text-black mt-1 text-sm font-medium">
                Pending discounts are automatically approved after 24 hours. You can also manually trigger auto-approval.
              </p>
              {autoApprovalInfo.lastAutoApproval && (
                <p className="text-black mt-1 text-xs font-medium">
                  Last auto-approval: {new Date(autoApprovalInfo.lastAutoApproval).toLocaleString()}
                </p>
              )}
            </div>

            {/* Auto-cleanup Info */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-black">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Automatic Cleanup Active</span>
              </div>
              <p className="text-black mt-1 text-sm font-medium">
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
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="trash">Trash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectedDiscounts.length > 0 && (
                <Button onClick={handleBulkApprove} className="rounded-lg">
                  Approve Selected ({selectedDiscounts.length})
                </Button>
              )}
              {statusFilter === "pending" && (
                <Button 
                  onClick={handleAutoApprove}
                  variant="outline" 
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Approve Ready
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
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
                    <TableCell>{discount.category}</TableCell>
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
                        <Badge variant="default" className="bg-purple-100 text-purple-800">
                          Sponsored
                        </Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(discount.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Discount Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Business Name</label>
                                  <p className="text-sm text-slate-900 font-medium">{discount.title}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-700">ZIP Code</label>
                                  <p className="text-sm text-slate-900 font-medium">{discount.zip}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Category</label>
                                  <p className="text-sm text-slate-900 font-medium">{discount.category}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-slate-700">Minimum Age</label>
                                  <p className="text-sm text-slate-900 font-medium">{discount.minAge}+</p>
                                </div>
                              </div>
                              
                              {discount.sd && (
                                <div className="space-y-4">
                                  <div className="border-t border-slate-200 pt-4">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Discount Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {discount.sd.amount && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Discount Amount</label>
                                          <p className="text-sm text-slate-900 font-medium">{discount.sd.amount}</p>
                                        </div>
                                      )}
                                      {discount.sd.days && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Valid Days</label>
                                          <p className="text-sm text-slate-900 font-medium">{discount.sd.days}</p>
                                        </div>
                                      )}
                                      {discount.sd.code && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Promo Code</label>
                                          <p className="text-sm text-slate-900 font-medium">{discount.sd.code}</p>
                                        </div>
                                      )}
                                      {discount.sd.location && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Location</label>
                                          <p className="text-sm text-slate-900 font-medium">{discount.sd.location}</p>
                                        </div>
                                      )}
                                      {discount.sd.scope && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Scope</label>
                                          <p className="text-sm text-slate-900 font-medium">{discount.sd.scope}</p>
                                        </div>
                                      )}
                                      {discount.sd.website && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Website</label>
                                          <p className="text-sm text-slate-900 font-medium">
                                            <a href={discount.sd.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                              Visit Website
                                            </a>
                                          </p>
                                        </div>
                                      )}
                                      {discount.sd.phone && (
                                        <div>
                                          <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Phone</label>
                                          <p className="text-sm text-slate-900 font-medium">{discount.sd.phone}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {discount.sd.proof && (
                                    <div className="border-t border-slate-200 pt-4">
                                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Proof/Reference</label>
                                      <p className="text-sm text-slate-900 font-medium">
                                        <a href={discount.sd.proof} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                                          View Proof
                                        </a>
                                      </p>
                                    </div>
                                  )}
                                  
                                  {discount.sd.notes && (
                                    <div className="border-t border-slate-200 pt-4">
                                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">Additional Notes</label>
                                      <p className="text-sm text-slate-900 font-medium">{discount.sd.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {statusFilter === "pending" && (
                          <>
                            <Button
                              onClick={() => handleApprove(discount.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                                  <X className="h-4 w-4" />
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
                                  className="min-h-[100px]"
                                />
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeny(discount.id, denyReason)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Deny
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
