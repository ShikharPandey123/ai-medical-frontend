"use client"

import useSWR, { mutate } from "swr"
import { useMemo, useState } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import axiosInstance from "../../lib/axiosInstance" 

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
  const [form, setForm] = useState<Partial<Patient>>({
    name: "",
    age: undefined,
    condition: "",
    lastVisit: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async () => {
    if (!form.name || !form.age || !form.condition) return
    setSubmitting(true)
    try {
      // Using axios instance instead of fetch
      await axiosInstance.post("/doctor/create-patient", form)
      
      // Revalidate the patients list
      await mutate("/patient/get-all-patients")
      
      // Close dialog and reset form
      onOpenChange(false)
      setForm({ name: "", age: undefined, condition: "", lastVisit: "" })
    } catch (error) {
      console.error("Failed to create patient:", error)
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

  const patients = data?.data?.patients ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q) || String(p.age).includes(q),
    )
  }, [patients, query])

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-10">
          <div className="text-muted-foreground">Loading patients...</div>
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
      {/* Search & Filters */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients"
            className="pl-9 bg-emerald-50/60 border-emerald-200 focus-visible:ring-emerald-200"
          />
        </div>
        <div className="ml-4 flex items-center gap-2">
          <Button variant="secondary" className="bg-muted hover:bg-muted">
            Age
          </Button>
          <Button variant="secondary" className="bg-muted hover:bg-muted">
            Tags
          </Button>
          <Button variant="secondary" className="bg-muted hover:bg-muted">
            Last Visit
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-foreground">
              <th className="px-6 py-3 font-medium">Patient Name</th>
              <th className="px-6 py-3 font-medium">Age</th>
              <th className="px-6 py-3 font-medium">Tags</th>
              <th className="px-6 py-3 font-medium">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-muted/30 cursor-pointer"
                onClick={() => (window.location.href = `/dashboard/patients/${p.id}`)}
              >
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4 text-emerald-700">{p.age}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-200 px-3 py-1 text-xs font-medium text-emerald-900">
                    {p.condition}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{p.lastVisit}</td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                  {query ? "No patients found matching your search." : "No patients found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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