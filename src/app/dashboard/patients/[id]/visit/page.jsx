"use client"

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import axiosInstance from "../../../../../lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VisitDetailPage() {
  const router = useRouter();
  const search = useSearchParams();
  const visitId = search.get("visitId");
  const { id } = useParams();
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [remedy, setRemedy] = useState("");
  const [tags, setTags] = useState([]);
  const [transcriptLoading, setTranscriptLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTranscript, setEditTranscript] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [summaryApproved, setSummaryApproved] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    setError(null);
    setTranscriptLoading(true);
    setSummaryLoading(true);

    // Fetch transcript first so it can display independently
    const fetchTranscript = async () => {
      try {
        const transRes = await axiosInstance.get(`/visit/${id}/${visitId}/transcript`);
        setTranscript(transRes.data?.transcript ?? "No transcription available.");
      } catch (err) {
        setError("Failed to fetch transcript.");
      } finally {
        setTranscriptLoading(false);
      }
    };

    // Fetch summary separately; don't block transcript render
    const fetchSummary = async () => {
      try {
        const summaryRes = await axiosInstance.get(`/visit/${id}/${visitId}/summary`);
        setSummary(summaryRes.data?.summary ?? "No summary available.");
        setRemedy(summaryRes.data?.remedy ?? "");
        setTags(Array.isArray(summaryRes.data?.perception_tag) ? summaryRes.data.perception_tag : []);
      } catch (err) {
        // Keep summary empty if it fails; transcript can still show
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchTranscript();
    fetchSummary();
  }, [visitId, id]);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <Button onClick={() => router.back()} className="mb-4">Back</Button>
      <h2 className="text-2xl font-bold mb-4">Visit Details</h2>
  {transcriptLoading ? (
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
                        let res;
                        res = await axiosInstance.put(`/visit/update-transcript/${visitId}`, { transcript_text: editTranscript });
                        const msg = res?.data?.message || "Transcript updated successfully";
                        const updatedTranscript = res?.data?.visit?.transcript_text ?? editTranscript;
                        setTranscript(updatedTranscript);
                        // Refetch transcript from server to ensure UI reflects the persisted value
                        try {
                          const transAfter = await axiosInstance.get(`/visit/${id}/${visitId}/transcript`);
                          if (transAfter?.data?.transcript != null) {
                            setTranscript(transAfter.data.transcript);
                          }
                        } catch (ignore) {
                          // Ignore refetch errors; we already set optimistic value
                        }
                        if (res?.data?.summary) {
                          setSummary(res.data.summary.summary_text || "");
                          setRemedy(res.data.summary.remedy || "");
                          setTags(Array.isArray(res.data.summary.perception_tag) ? res.data.summary.perception_tag : []);
                        }
                        setUpdateMessage(msg);
                        setEditMode(false);
                        toast.success(msg);
                      } catch (err) {
                        const errMsg = err?.response?.data?.message || "Failed to update transcription";
                        setUpdateMessage(errMsg);
                        toast.error(errMsg);
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
            {summaryLoading ? (
              <div>Loading summary...</div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4 mb-2">{summary}</div>
            )}
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
                  const res = await axiosInstance.put(`/visit/approved-summary/${visitId}`, {
                    summary_text: summary,
                    perception_tag: tags,
                    remedy,
                  });
                  const srvSummary = res?.data?.summary;
                  if (srvSummary) {
                    setSummary(srvSummary.summary_text || "");
                    setRemedy(srvSummary.remedy || "");
                    setTags(Array.isArray(srvSummary.perception_tag) ? srvSummary.perception_tag : []);
                  }
                  setSummaryApproved(true);
                  toast.success(res?.data?.message || "Summary approved");
                } catch (err) {
                  toast.error(err?.response?.data?.message || "Failed to approve summary");
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
          const res = await axiosInstance.get(`/visit/${id}/${visitId}/send-summary`);
          const url = res?.data?.pdfUrl || res?.data?.pdf_url || res?.data?.url || "";
                    setPdfUrl(url);
          toast.success(res?.data?.message || "Summary sent to patient via email and SMS");
                  } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to send summary");
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
