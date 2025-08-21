"use client"

import React, { useState } from "react"
import api from "../../../lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleStartRecording = () => {
    setIsRecording(true)
    setTranscript(null)
    setSummary(null)
  }

  const handleStopRecording = async () => {
    setIsRecording(false)
    setLoading(true)
    try {
      // Step 1: Upload + Transcribe
      const res = await api.post("/transcribe", { audioFile: "dummy.mp3" })
      setTranscript(res.data.transcript)

      // Step 2: Summarize
      const sumRes = await api.post("/summarize", { transcript: res.data.transcript })
      setSummary(sumRes.data)
    } catch (err) {
      // 🧪 Dummy fallback
      setTranscript(
        "Doctor: What brings you in today?\nPatient: I've been feeling tired and urinating frequently.\nDoctor: Any medical history?\nPatient: Yes, diabetes for 5 years."
      )
      setSummary({
        reasonForVisit: "Patient complains of fatigue and frequent urination",
        symptoms: ["Fatigue", "Frequent urination"],
        diagnosis: "Poorly managed Diabetes Mellitus",
        treatment: ["Prescribed Metformin 500mg twice daily", "Recommended lifestyle modifications"],
        followUp: "Review after 2 weeks with blood sugar log",
        perceptionTags: ["Patient appears fatigued", "Chronic condition: Diabetes"],
        remedies: ["Stay hydrated", "Regular exercise", "Balanced diet"],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => {
    console.log("Summary approved and saved ✅")
    // Here you would call `/approve` or `/save-visit` API
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Recording Page</h1>

      <Card className="mb-6">
        <CardContent className="p-6">
          {!isRecording && !transcript && (
            <Button
              onClick={handleStartRecording}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
            >
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={handleStopRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
            >
              Stop Recording
            </Button>
          )}

          {loading && <p className="mt-4 text-gray-500">Processing audio…</p>}
        </CardContent>
      </Card>

      {transcript && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Transcript</h2>
            <pre className="bg-gray-100 p-4 rounded-md text-gray-800 whitespace-pre-wrap">
              {transcript}
            </pre>
          </CardContent>
        </Card>
      )}

      {summary && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Visit Summary</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Reason for Visit:</strong> {summary.reasonForVisit}</p>
              <p><strong>Symptoms:</strong> {summary.symptoms.join(", ")}</p>
              <p><strong>Diagnosis:</strong> {summary.diagnosis}</p>
              <p><strong>Treatment:</strong> {summary.treatment.join(", ")}</p>
              <p><strong>Follow-Up:</strong> {summary.followUp}</p>
              <p><strong>Perception Tags:</strong> {summary.perceptionTags.join(", ")}</p>
              <p><strong>At-Home Remedies:</strong> {summary.remedies.join(", ")}</p>
            </div>

            <Button
              onClick={handleApprove}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Approve & Save
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RecordingPage
