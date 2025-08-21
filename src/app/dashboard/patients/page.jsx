"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import axiosInstance from "../../../../lib/axiosInstance"

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
      (patient) => patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.id.includes(searchQuery),
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <Button className="bg-green-500 hover:bg-green-600 text-white font-medium px-6">
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
                  <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
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
                    <span className="font-medium">Gender:</span> {patient.gender}
                  </p>
                  <p>
                    <span className="font-medium">Last Visit:</span> {patient.lastVisit}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No patients found matching your search.</p>
        </div>
      )}
    </div>
  )
}