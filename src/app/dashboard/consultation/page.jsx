"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import api from "../../../lib/axiosInstance"

export default function ConsultationPage() {
  const router = useRouter()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [visits, setVisits] = useState([])

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients")
        setPatients(res.data)
      } catch (err) {
        // 🧪 fallback dummy patients
        setPatients([
          { id: "1234567", name: "Sophia Clark" },
          { id: "1234568", name: "John Smith" },
          { id: "1234569", name: "Emma Johnson" },
        ])
      }
    }
    fetchPatients()
  }, [])

  const handlePatientSelect = async (patientId) => {
    setSelectedPatient(patientId)
    try {
      const res = await api.get(`/get-patient/${patientId}`)
      setVisits(res.data.visits)
    } catch (err) {
      // 🧪 dummy visit history
      setVisits([
        {
          id: "v1",
          date: "2025-08-10",
          summary: "Patient reported fatigue and high sugar levels. Prescribed Metformin.",
        },
        {
          id: "v2",
          date: "2025-07-25",
          summary: "Routine check-up. No major issues.",
        },
      ])
    }
  }

  const handleNewConsultation = () => {
    if (!selectedPatient) return alert("Please select a patient first.")
    router.push(`/dashboard/recording?patientId=${selectedPatient}`)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Consultation</h1>

      {/* Patient Selector */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Select Patient</h2>
          <Select onValueChange={handlePatientSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Visit History */}
      {selectedPatient && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Previous Visits</h2>
            {visits.length > 0 ? (
              <ul className="space-y-3">
                {visits.map((visit) => (
                  <li
                    key={visit.id}
                    className="p-4 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <p className="text-sm text-gray-500">{visit.date}</p>
                    <p className="text-gray-800">{visit.summary}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No visits found.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Consultation Button */}
      {selectedPatient && (
        <div>
          <Button
            onClick={handleNewConsultation}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
          >
            Start New Consultation
          </Button>
        </div>
      )}
    </div>
  )
}
