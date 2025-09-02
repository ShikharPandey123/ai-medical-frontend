"use client"

import useSWR, { mutate } from "swr"
import { useMemo, useState } from "react"
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import axiosInstance from "../../lib/axiosInstance";

type Patient = {
  id: string
  name: string
  age: number
  condition: string
  lastVisit: string
  email?: string
  phone?: string
  dob?: string
  gender?: string
  medical_history?: string
}

type GetPatientsResponse = { data: { patients: Patient[] } }

// Updated fetcher to use axios instance
const fetcher = async (url: string) => {
  const response = await axiosInstance.get(url)
  return response.data
}

function AddPatientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [form, setForm] = useState({
    name: "",
    age: undefined as number | undefined,
    condition: "",
    lastVisit: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!form.name || !form.age || !form.condition) return;
    setSubmitting(true);
    try {
      await axiosInstance.post("/doctor/create-patient", form);
      // Revalidate the patients list
      await mutate("/patient/get-all-patients");
      // Close dialog and reset form
      onOpenChange(false);
      setForm({ name: "", age: undefined, condition: "", lastVisit: "" });
    } catch (error) {
      // You could add toast notification here
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={form.name ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              placeholder="Sophia Clark"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={0}
              value={form.age ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, age: Number(e.target.value) }))}
              placeholder="35"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="condition">Condition (Tag)</Label>
            <Input
              id="condition"
              value={form.condition ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, condition: e.target.value }))}
              placeholder="Diabetes"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastVisit">Last Visit</Label>
            <Input
              id="lastVisit"
              type="date"
              value={form.lastVisit ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, lastVisit: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Adding..." : "Add Patient"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PatientsClient() {
  const { data, error, isLoading } = useSWR<GetPatientsResponse>("/patient/get-all-patients", fetcher)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "age" | "condition" | "lastVisit" | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const patients = data?.data?.patients ?? []

  const filtered = useMemo(() => {
    let result = [...patients];
    
    // Apply search filter
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (p) =>
          (p.name?.toLowerCase() || "").includes(q) ||
          (p.condition?.toLowerCase() || "").includes(q) ||
          String(p.age ?? "").includes(q)
      );
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";

        switch (sortBy) {
          case "name":
            aVal = a.name?.toLowerCase() || "";
            bVal = b.name?.toLowerCase() || "";
            break;
          case "age":
            aVal = a.age || 0;
            bVal = b.age || 0;
            break;
          case "condition":
            aVal = a.condition?.toLowerCase() || "";
            bVal = b.condition?.toLowerCase() || "";
            break;
          case "lastVisit":
            aVal = a.lastVisit || "";
            bVal = b.lastVisit || "";
            break;
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [patients, query, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filtered.slice(startIndex, endIndex);

  // Reset to first page when search or sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, [query, sortBy, sortOrder]);

  const handleSort = (field: "age" | "condition" | "lastVisit") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <div className="text-muted-foreground">Loading patients...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-10">
          <div className="text-red-600">Error loading patients. Please try again.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Only */}
      <div className="flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients"
            className="pl-9 bg-emerald-50/60 border-emerald-200 focus-visible:ring-emerald-200"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-foreground">
              <th className="px-6 py-3 font-medium">Patient Name</th>
              <th className="px-6 py-3 font-medium">Age</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                onClick={() => (window.location.href = `/dashboard/patients/${p.id}`)}
              >
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4 text-emerald-700">{p.age}</td>
              </tr>
            ))}

            {paginatedPatients.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-10 text-center text-muted-foreground">
                  {query ? "No patients found matching your search." : "No patients found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} patients
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;
                  
                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="text-muted-foreground px-2">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={`h-8 w-8 p-0 ${
                          currentPage === page 
                            ? "bg-emerald-500 hover:bg-emerald-600" 
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AddPatientDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

export function AddPatientButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-emerald-500 hover:bg-emerald-600">
        <Plus className="mr-2 h-4 w-4" />
        Add New Patient
      </Button>
      <AddPatientDialog open={open} onOpenChange={setOpen} />
    </>
  )
}