"use client"
import { useState } from "react"
// import api from "@/lib/axios"  // your axios instance

export default function RecordVisitPage() {
  const [loading, setLoading] = useState(false)
  const [transcript, setTranscript] = useState(null)
  const [summary, setSummary] = useState(null)

  const handleRecordVisit = async () => {
    setLoading(true)
    try {
      // ⏺️ Step 1: Upload + Transcribe audio
      const res = await api.post("/transcribe", {
        audioFile: "dummy_audio.mp3" // placeholder
      })

      setTranscript(res.data.transcript)

      // ⏺️ Step 2: Summarize visit
      const sumRes = await api.post("/summarize", {
        transcript: res.data.transcript
      })

      setSummary(sumRes.data)
    } catch (err) {
      // 🧪 Dummy fallback data
      setTranscript(
        "Doctor: What brings you in today?\nPatient: I've been feeling very tired and having frequent urination.\nDoctor: Any medical history?\nPatient: Yes, diabetes for 5 years."
      )
      setSummary({
        reasonForVisit: "Patient complains of fatigue and frequent urination",
        symptoms: ["Fatigue", "Frequent urination"],
        diagnosis: "Poorly managed Diabetes Mellitus",
        treatment: ["Prescribed Metformin 500mg twice daily", "Recommended lifestyle modifications"],
        followUp: "Review after 2 weeks with blood sugar log",
        perceptionTags: ["Patient appears fatigued", "Chronic condition: Diabetes"],
        remedies: ["Stay hydrated", "Regular exercise", "Balanced diet"]
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Record New Visit</h1>

      <div className="bg-white p-8 rounded-lg border border-gray-200">
        {!transcript && !summary && (
          <button
            onClick={handleRecordVisit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Start Recording (Dummy)"}
          </button>
        )}

        {transcript && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Transcript</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
              {transcript}
            </pre>
          </div>
        )}

        {summary && (
          <div className="mt-6">
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
          </div>
        )}
      </div>
    </div>
  )
}
