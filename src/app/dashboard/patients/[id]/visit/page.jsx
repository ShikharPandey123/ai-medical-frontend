"use client"

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "../../../../../lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VisitDetailPage({ params, searchParams }) {
  const router = useRouter();
  const search = useSearchParams();
  const visitId = search.get("visitId");
  const { id } = params;
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [remedy, setRemedy] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTranscript, setEditTranscript] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [localTranscript, setLocalTranscript] = useState(null);
  const [summaryApproved, setSummaryApproved] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (!visitId) return;
    setLoading(true);
    setError(null);
    // Check for locally updated transcript first
    const updated = localStorage.getItem(`updated-transcript-${visitId}`);
    if (updated) {
      setTranscript(updated);
      setLocalTranscript(updated);
      setLoading(false);
      return;
    }
    // Check for dummy/local visit first
    const localVisits = JSON.parse(localStorage.getItem('localVisits') || '[]');
    const localVisit = localVisits.find(v => String(v.id) === String(visitId) && String(v.patient_id) === String(id));
    if (localVisit) {
      // Populate dummy data in backend format
      setTranscript('Hi, Mr. Jones, how are you? I\'m good, Dr. Smith. Nice to see you. ... (dummy transcript)');
      setSummary('Mr. Jones returns to Dr. Smith for recurring back pain ... (dummy summary)');
      setRemedy('Use a heating pad for back pain relief and consider yoga or tai chi classes. ... (dummy remedy)');
      setTags(['chronic pain', 'cost concerns', 'importance of physical therapy', 'alternative therapies', 'insurance issues']);
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [transRes, summaryRes] = await Promise.all([
          axiosInstance.get(`/visit/${id}/${visitId}/transcript`),
          axiosInstance.get(`/visit/${id}/${visitId}/summary`),
        ]);
        setTranscript(transRes.data.transcript || "No transcription available.");
        setSummary(summaryRes.data.summary || "No summary available.");
        setRemedy(summaryRes.data.remedy || "");
        setTags(summaryRes.data.perception_tag || []);
      } catch (err) {
        setTranscript('Hi, Mr. Jones, how are you? I\'m good, Dr. Smith. Nice to see you. ... (dummy transcript)');
        setSummary('Mr. Jones returns to Dr. Smith for recurring back pain ... (dummy summary)');
        setRemedy('Use a heating pad for back pain relief and consider yoga or tai chi classes. ... (dummy remedy)');
        setTags(['chronic pain', 'cost concerns', 'importance of physical therapy', 'alternative therapies', 'insurance issues']);
        setError(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [visitId, id]);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <Button onClick={() => router.back()} className="mb-4">Back</Button>
      <h2 className="text-2xl font-bold mb-4">Visit Details</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="mb-6">
            <strong>Transcription:</strong>
            {editMode ? (
              <>
                <textarea
                  className="w-full border rounded p-2 mt-2"
                  rows={8}
                  value={editTranscript}
                  onChange={e => setEditTranscript(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={async () => {
                      setUpdateLoading(true);
                      setUpdateMessage("");
                      try {
                        // Dummy API call
                        // await axiosInstance.post(`/visit/update-transcript/${visitId}`, { transcript_text: editTranscript });
                        await new Promise(res => setTimeout(res, 1000)); // simulate network
                        setTranscript(editTranscript);
                        setLocalTranscript(editTranscript);
                        localStorage.setItem(`updated-transcript-${visitId}`, editTranscript);
                        setUpdateMessage("Transcription updated successfully (dummy)");
                        setEditMode(false);
                      } catch (err) {
                        setUpdateMessage("Failed to update transcription (dummy)");
                      } finally {
                        setUpdateLoading(false);
                      }
                    }}
                    disabled={updateLoading}
                    className="bg-green-600 text-white"
                  >
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} disabled={updateLoading}>Cancel</Button>
                </div>
                {updateMessage && <div className="mt-2 text-sm text-green-600">{updateMessage}</div>}
              </>
            ) : (
              <>
                <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">{transcript}</pre>
                <Button className="mt-2" onClick={() => { setEditTranscript(transcript); setEditMode(true); }}>Update Transcription</Button>
                {updateMessage && <div className="mt-2 text-sm text-green-600">{updateMessage}</div>}
              </>
            )}
          </div>
          <div className="mb-6">
            <strong>Summary:</strong>
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-2">{summary}</div>
            {remedy && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-2">
                <strong>Remedy:</strong> {remedy}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
            {!summaryApproved && (
              <Button className="mt-4" disabled={approveLoading} onClick={async () => {
                setApproveLoading(true);
                try {
                  // Dummy API call
                  // await axiosInstance.post(`/visit/approved-summary/${visitId}`, { summary_text: summary, perception_tag: tags, remedy });
                  await new Promise(res => setTimeout(res, 1000)); // simulate network
                  setSummaryApproved(true);
                  toast.success("Summary approved (dummy)");
                } catch (err) {
                  setSummaryApproved(true);
                  toast.success("Summary approved (dummy)");
                } finally {
                  setApproveLoading(false);
                }
              }}>Approve Summary</Button>
            )}
            {summaryApproved && (
              <div className="flex gap-2 mt-4">
                <Button disabled={sendLoading} onClick={async () => {
                  setSendLoading(true);
                  try {
                    // Dummy API call
                    // const res = await axiosInstance.post(`/visit/${patientId}/${visitId}/send-summary`);
                    await new Promise(res => setTimeout(res, 1000)); // simulate network
                    setPdfUrl("https://testmedical1.s3.amazonaws.com/summaries/visit_22_1755858566530.pdf");
                    toast.success("Summary sent to patient via email and SMS (dummy)");
                  } catch (err) {
                    setPdfUrl("https://testmedical1.s3.amazonaws.com/summaries/visit_22_1755858566530.pdf");
                    toast.success("Summary sent to patient via email and SMS (dummy)");
                  } finally {
                    setSendLoading(false);
                  }
                }}>Send Summary via Email & SMS</Button>
                {pdfUrl && (
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">View PDF</a>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
