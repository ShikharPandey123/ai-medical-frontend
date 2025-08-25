"use client"

import { useState, useEffect } from "react"
import { toast, Toaster } from "sonner"
import Link from "next/link"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axiosInstance from "../../../lib/axiosInstance"

export default function PatientsPage() {
  const [patients, setPatients] = useState([
    {
      id: "1234567",
      name: "Sophia Clark",
      age: 32,
      gender: "Female",
      lastVisit: "2023-08-15",
      status: "active",
    },
    {
      id: "1234568",
      name: "John Smith",
      age: 45,
      gender: "Male",
      lastVisit: "2023-08-14",
      status: "pending",
    },
    {
      id: "1234569",
      name: "Emma Johnson",
      age: 28,
      gender: "Female",
      lastVisit: "2023-08-13",
      status: "active",
    },
  ])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPatients, setFilteredPatients] = useState(patients)
  const [open, setOpen] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: "",
    email: "",
    dob: "",
    medical_history: "",
    phone_number: "",
  })

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axiosInstance.get("/patients")
        setPatients(response.data)
        setFilteredPatients(response.data)
      } catch (error) {
        console.error("Failed to fetch patients:", error)
      }
    }

    fetchPatients()
  }, [])

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.includes(searchQuery),
    )
    setFilteredPatients(filtered)
  }, [searchQuery, patients])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddPatient = async () => {
    try {
      // Log the data being sent
      console.log("Sending new patient data:", newPatient);
      const response = await axiosInstance.post("/doctor/create-patient", newPatient);
      console.log("Backend response:", response.data);

      // Extract patient from backend response
      const createdPatient = {
        id: response.data.patient?.id || String(Date.now()),
        name: response.data.patient?.name || newPatient.name,
        email: response.data.patient?.email || newPatient.email,
        phone_number: response.data.patient?.phone_number || newPatient.phone_number,
        dob: response.data.patient?.dob || newPatient.dob,
        medical_history: response.data.patient?.medical_history || newPatient.medical_history,
      };

      setPatients((prev) => [...prev, createdPatient]);
      setFilteredPatients((prev) => [...prev, createdPatient]);
  toast.success("Patient added successfully!");
    } catch (error) {
      console.error("Failed to add patient:", error);
  toast.error("Failed to add patient. Check console for details.");
    } finally {
      setNewPatient({ name: "", email: "", dob: "", medical_history: "", phone_number: "" });
      setOpen(false);
    }
  };


  return (
    <div className="p-8">
      <Toaster position="top-right" richColors />
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <Button
          onClick={() => setOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-green-50 border-green-200 focus:border-green-300 focus:ring-green-200"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <Link key={patient.id} href={`/dashboard/patients/${patient.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {patient.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      patient.status,
                    )}`}
                  >
                    {patient.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">ID:</span> {patient.id}
                  </p>
                  <p>
                    <span className="font-medium">Age:</span> {patient.age}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {patient.gender}
                  </p>
                  <p>
                    <span className="font-medium">Last Visit:</span>{" "}
                    {patient.lastVisit}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No patients found matching your search.
          </p>
        </div>
      )}

      {/* Add Patient Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={newPatient.dob}
                onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={newPatient.phone_number}
                onChange={(e) => setNewPatient({ ...newPatient, phone_number: e.target.value })}
              />
            </div>
            <div>
              <Label>Medical History</Label>
              <Input
                value={newPatient.medical_history}
                onChange={(e) => setNewPatient({ ...newPatient, medical_history: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPatient}>Add Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
