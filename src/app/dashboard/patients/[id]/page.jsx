"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axiosInstance from "../../../../lib/axiosInstance"

export default function PatientDetailPage({ params }) {
  const [patient, setPatient] = useState({
    id: "1234567",
    name: "Sophia Clark",
    age: 32,
    gender: "Female",
    contact: "(555) 123-4567",
    allergies: ["Penicillin"],
    medications: ["Lisinopril"],
    conditions: ["Hypertension"],
  })

  const [doctor] = useState({
    name: "Dr. Mark Harrison",
    specialty: "Cardiologist",
  })

  const [consultations] = useState([
    { id: "1", type: "Follow-up Appointment", date: "2023-08-15" },
    { id: "2", type: "Initial Consultation", date: "2023-07-20" },
  ])

  const [consultationNotes, setConsultationNotes] = useState("")
  const [activeTab, setActiveTab] = useState("consultation-notes")

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axiosInstance.get(`/patients/${params.id}`)
        setPatient(response.data)
      } catch (error) {
        console.error("Failed to fetch patient data:", error)
      }
    }

    fetchPatientData()
  }, [params.id])

  const handleStartRecording = () => {
    console.log("Start recording for patient:", patient.name)
  }

  const handleSaveNotes = async () => {
    try {
      await axiosInstance.post(`/patients/${params.id}/notes`, {
        notes: consultationNotes,
      })
      console.log("Notes saved successfully")
    } catch (error) {
      console.error("Failed to save notes:", error)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Patient Info */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* Doctor Profile */}
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt={doctor.name} />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-green-600">{doctor.specialty}</p>
          </div>

          {/* Patient Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Patient Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{patient.age}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{patient.contact}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Allergies</p>
                <p className="text-sm">{patient.allergies.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Medications</p>
                <p className="text-sm">{patient.medications.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Conditions</p>
                <p className="text-sm">{patient.conditions.join(", ")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Consultations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{consultation.type}</p>
                      <p className="text-xs text-gray-500">{consultation.date}</p>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-8">
          {/* Patient Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-green-600 mt-1">Patient ID: {patient.id}</p>
            </div>
            <Button
              onClick={handleStartRecording}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-6"
            >
              Start Recording
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="consultation-notes" className="data-[state=active]:bg-white">
                Consultation Notes
              </TabsTrigger>
              <TabsTrigger value="transcriptions" className="data-[state=active]:bg-white">
                Transcriptions
              </TabsTrigger>
              <TabsTrigger value="summaries" className="data-[state=active]:bg-white">
                Summaries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consultation-notes" className="space-y-4">
              <Textarea
                placeholder="Enter consultation notes here"
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="min-h-[400px] bg-white border-gray-200 focus:border-green-300 focus:ring-green-200"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotes}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-6"
                >
                  Save Notes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="transcriptions" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[400px]">
                <p className="text-gray-500">Transcriptions will appear here...</p>
              </div>
            </TabsContent>

            <TabsContent value="summaries" className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[400px]">
                <p className="text-gray-500">Summaries will appear here...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}