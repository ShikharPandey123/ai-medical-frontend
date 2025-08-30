"use client"
import { useState } from "react"
import axiosInstance from "@/lib/axiosInstance"

export default function RecordVisitPage() {
  const [loading, setLoading] = useState(false)
  const [visit, setVisit] = useState(null)
  const [error, setError] = useState(null)

  const handleRecordVisit = async () => {
    setLoading(true)
    setError(null)
  setVisit(null)
    try {
      // Step 1: Start visit and get transcript
      const res = await axiosInstance.post("/visit/start", {
        // Add any required payload fields here, e.g. patient_id, doctor_id, etc.
        // For demo: patient_id: 9, doctor_id: 1
        patient_id: 9,
        doctor_id: 1,
        // Optionally, visit_date, audio_file_url, etc.
      })
  const visit = res.data.visit;
  setVisit(visit);

      // Step 2: Summarize visit (if you have a separate endpoint)
      // If your backend returns summary directly, skip this step
      // Otherwise, call your summarize endpoint:
      // const sumRes = await axiosInstance.post("/summarize", { transcript: visit.transcript_text })
      // setSummary(sumRes.data)

      // If summary is not available, just show transcript
    } catch (err) {
      setError("Failed to record visit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Record New Visit</h1>
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {(!visit && (
          <>
            <button
              onClick={handleRecordVisit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Processing..." : "Start Visit"}
            </button>
            {/* Show dummy data for demonstration */}
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold mb-2">Visit Details (Demo)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Visit ID:</strong> 22</p>
                  <p><strong>Patient ID:</strong> 9</p>
                  <p><strong>Doctor ID:</strong> 1</p>
                  <p><strong>Visit Date:</strong> {new Date("2025-08-20T10:30:00.000Z").toLocaleString()}</p>
                  <p><strong>Status:</strong> pending</p>
                  <p><strong>Language:</strong> english</p>
                  <p><strong>Audio File:</strong> <a href="https://dummy-bucket.s3.amazonaws.com/audio/visit123.mp3" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Listen</a></p>
                  <p><strong>Created At:</strong> {new Date("2025-08-22T09:52:44.954Z").toLocaleString()}</p>
                  <p><strong>Updated At:</strong> {new Date("2025-08-22T09:53:11.737Z").toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Transcript</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
Hi, Mr. Jones, how are you? I'm good, Dr. Smith. Nice to see you. Nice to see you again. What brings you back? Well, my back's been hurting again. Oh, I see. I've seen you a number of times for this, haven't I? Yeah, well, ever since I got hurt on the job three years ago, it's something that just keeps coming back. It'll be fine for a while, and then I'll bend down or I'll move in a weird way, and then, boom, it'll just go out again. Unfortunately, that can happen, and I do have quite a few patients who get reoccurring episodes of back pain. Have you been keeping up with the therapy that we had you on before? The pills? Actually, I was talking about the physical therapy that we had you doing. The pills are only meant for short-term because they don't actually prevent the back pain from coming back. See, yeah, once my back started feeling better, I was happy not to go to the therapist anymore. Why was that? It was starting to become kind of a hassle with my work schedule and the cost was an issue, but I was able to get back to work, and I could use the money. Do you think the physical therapy was helping? Yeah, well, it was slow going at first. I see. Physical therapy is a bit slower than medications, but the point is to build up the core muscles in your back and your abdomen. Physical therapy is also less invasive than medications, so that's why we had you doing the therapy. But you mentioned that cost was getting to be a real issue for you. Can you tell me more about that? Well, the insurance I had only covered a certain number of sessions, and then they moved my therapy office because they were trying to work out my schedule at work, but that was really far away, and then I had to deal with parking, and it just started to get really expensive. Got it. I understand. For now, I'd like you to try using a heating pad for your back pain. So that should help in the short term. Our goal is to get your back pain under better control without creating additional problems for you like cost. Let's talk about some different options and the pros and cons of each. So the physical therapy is actually really good for your back pain, but there are other things we can be doing to help. Yes, I definitely don't need to lose any more time at work and just lie around the house all day. Okay, well, there are some alternative therapies like yoga or tai chi classes or meditation therapies that might be able to help, and they might also be closer to you and be less expensive. Would that be something you'd be interested in? Sure, that'd be great. Good. Let's talk about some of the other costs of your care. In the past, we had you on some tramadol because the physical therapy alone wasn't working. Yeah, that medicine was working really well, but again, the cost of it got really expensive. Yeah, yeah. So that is something in the future we could order, something like a generic medication. And then there are also resources for people to look up the cheapest cost of their medications. But for now, I think that's it. I'd like to stick with the non-prescription medications, and if we can have you go to yoga or tai chi classes, like I mentioned, that could alleviate the need for ordering prescriptions. Okay, yeah, that sounds good. Okay, great, great. Are there any other costs that are a problem for you in your care? Well, my insurance isn't going down, but that seems to be the case for everybody that I talk to, but I should be able to make it work. Yeah, unfortunately, that is an issue for a lot of people, but I would encourage you during open season to look at your different insurance options to see which plan is more cost-effective for you. Okay, yeah, that sounds great. Great, great. Well, I appreciate you talking to me today. Yeah, I'm glad you were able to come in. What I'll do is I'll have my office team research the different things that you and I talked about today, and then let's set a time early next week, say Tuesday, where we can talk over the phone about what we were able to come up with for you and see if those would work for you. Okay, great. Great. \u266a\u266a\u266a \u266a\u266a\u266a
                </pre>
              </div>
            </div>
          </>
        ))}
        {visit && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Visit Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Visit ID:</strong> {visit.id}</p>
                <p><strong>Patient ID:</strong> {visit.patient_id}</p>
                <p><strong>Doctor ID:</strong> {visit.doctor_id}</p>
                <p><strong>Visit Date:</strong> {visit.visit_date ? new Date(visit.visit_date).toLocaleString() : "-"}</p>
                <p><strong>Status:</strong> {visit.status}</p>
                <p><strong>Language:</strong> {visit.language}</p>
                <p><strong>Audio File:</strong> {visit.audio_file_url ? (
                  <a href={visit.audio_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Listen</a>
                ) : "-"}</p>
                <p><strong>Created At:</strong> {visit.createdAt ? new Date(visit.createdAt).toLocaleString() : "-"}</p>
                <p><strong>Updated At:</strong> {visit.updatedAt ? new Date(visit.updatedAt).toLocaleString() : "-"}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Transcript</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-gray-800 whitespace-pre-wrap">
                {visit.transcript_text || "No transcript available."}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}