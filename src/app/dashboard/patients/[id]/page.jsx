"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Mic, StopCircle, UploadCloud, User, Edit3, CheckCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import axios from "axios"
import axiosInstance from "../../../../lib/axiosInstance"
import { toast } from "sonner"
import { convertWebmToMp3 } from "../../../../lib/audioConvert"

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState({ name: '', specialization: '' });
  const [activeTab, setActiveTab] = useState("transcriptions");
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitSummaries, setVisitSummaries] = useState({});
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(null);
  const [editTranscriptText, setEditTranscriptText] = useState("");
  const [updatingTranscript, setUpdatingTranscript] = useState(false);
  const [approvingSummary, setApprovingSummary] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(null);

  // Edit Summary Dialog State
  const [editingSummary, setEditingSummary] = useState(null);
  const [editSummaryData, setEditSummaryData] = useState({
    summary: '',
    remedy: '',
    perception_tag: []
  });
  const [updatingSummary, setUpdatingSummary] = useState(false);

  // Audio recording state
  const [showMicDialog, setShowMicDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [s3UploadUrl, setS3UploadUrl] = useState(null);
  const [s3FileKey, setS3FileKey] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // API data fetching
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await axiosInstance.get('/doctor/doctor-dashboard');
        const doctorData = response.data?.data?.doctor;
        if (doctorData) {
          setDoctor({ name: doctorData.name, specialization: doctorData.specialization });
        }
      } catch (error) {
        console.error('Failed to fetch doctor data:', error);
      }
    };
    fetchDoctorData();
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axiosInstance.get(`/patient/get-patient-by-id/${id}`)
        const patientData = response.data?.data?.patient;
        if (patientData) {
          setPatient(patientData);
        } else {
          console.error("No patient data found in response", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch patient data:", error)
      }
    };
    if (id) fetchPatientData();
  }, [id]);

  const fetchVisits = async () => {
    setVisitsLoading(true);
    try {
      const res = await axiosInstance.get(`/visit/${id}/visit-history`);
      const apiVisits = Array.isArray(res.data?.visits) ? res.data.visits : [];
      apiVisits.sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
      setVisits(apiVisits);
    } catch (err) {
      setVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  };

  const fetchVisitSummary = async (patientId, visitId) => {
    try {
      const res = await axiosInstance.get(`/visit/${id}/${visitId}/summary`);
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch summary for visit ${visitId}:`, err);
      return null;
    }
  };

  const fetchAllSummaries = async () => {
    if (visits.length === 0) return;
    
    setSummariesLoading(true);
    const summariesData = {};
    
    await Promise.all(
      visits.map(async (visit) => {
        const summaryData = await fetchVisitSummary(id, visit.id);
        if (summaryData) {
          summariesData[visit.id] = summaryData;
        }
      })
    );
    
    setVisitSummaries(summariesData);
    setSummariesLoading(false);
  };

  const handleUpdateTranscript = (visit) => {
    setEditingTranscript(visit);
    setEditTranscriptText(visit.transcript_text || "");
  };

  const handleSaveTranscript = async () => {
    if (!editingTranscript) return;
    
    setUpdatingTranscript(true);
    try {
      await axiosInstance.put(`/visit/update-transcript/${editingTranscript.id}`, {
        transcript_text: editTranscriptText
      });
      
      // Update the local visits state
      setVisits(prevVisits => 
        prevVisits.map(visit => 
          visit.id === editingTranscript.id 
            ? { ...visit, transcript_text: editTranscriptText }
            : visit
        )
      );

      toast.success('Transcript updated successfully!');
      setEditingTranscript(null);
      setEditTranscriptText("");
    } catch (error) {
      console.error('Failed to update transcript:', error);
      toast.error('Failed to update transcript. Please try again.');
    } finally {
      setUpdatingTranscript(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTranscript(null);
    setEditTranscriptText("");
  };

  // New function to handle "Update and Approve" button
  const handleUpdateAndApprove = (visit) => {
    const summaryData = visitSummaries[visit.id];
    if (summaryData) {
      setEditingSummary(visit);
      setEditSummaryData({
        summary: summaryData.summary || '',
        remedy: summaryData.remedy || '',
        perception_tag: summaryData.perception_tag || []
      });
    } else {
      toast.error('No summary data found for this visit.');
    }
  };

  // Function to handle tag input changes
  const handleTagInput = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setEditSummaryData(prev => ({
      ...prev,
      perception_tag: tags
    }));
  };

  // Function to save updated summary
  const handleSaveSummary = async () => {
    if (!editingSummary) return;
    
    setUpdatingSummary(true);
    try {
      const requestBody = {
        summary_text: editSummaryData.summary,
        perception_tag: editSummaryData.perception_tag,
        remedy: editSummaryData.remedy
      };
      
      await axiosInstance.put(`/visit/approved-summary/${editingSummary.id}`, requestBody);
      toast.success('Summary updated and approved successfully!');
      
      // Update local state
      setVisitSummaries(prev => ({
        ...prev,
        [editingSummary.id]: {
          ...editSummaryData,
          approved: true
        }
      }));
      
      // Close dialog
      setEditingSummary(null);
      setEditSummaryData({ summary: '', remedy: '', perception_tag: [] });
      
    } catch (error) {
      console.error('Failed to update summary:', error);
      toast.error('Failed to update summary. Please try again.');
    } finally {
      setUpdatingSummary(false);
    }
  };

  const handleCancelSummaryEdit = () => {
    setEditingSummary(null);
    setEditSummaryData({ summary: '', remedy: '', perception_tag: [] });
  };

  const handleApproveSummary = async (visitId) => {
    setApprovingSummary(visitId);
    try {
      const summaryData = visitSummaries[visitId];
      if (!summaryData) {
        toast.error('No summary data found for this visit.');
        return;
      }
      const requestBody = {
        summary_text: summaryData.summary,
        perception_tag: summaryData.perception_tag || [],
        remedy: summaryData.remedy || ''
      };
      await axiosInstance.put(`/visit/approved-summary/${visitId}`, requestBody);
      toast.success('Summary approved successfully!');
      // Refetch the summary for this visit, but do NOT set status to approved
      const updatedSummary = await fetchVisitSummary(id, visitId);
      setVisitSummaries(prev => ({
        ...prev,
        [visitId]: {
          ...(updatedSummary || prev[visitId]),
          approved: true // Only for UI logic, not for status
        }
      }));
      // Do NOT update visit status here
    } catch (error) {
      console.error('Failed to approve summary:', error);
      toast.error('Failed to approve summary. Please try again.');
    } finally {
      setApprovingSummary(null);
    }
  };

  const handleSendSummary = async (visitId, method = 'email') => {
    setSendingNotification(visitId);
    try {
      const summaryData = visitSummaries[visitId];
      if (!summaryData || !patient) {
        toast.error('Missing summary or patient data.');
        return;
      }
      // Call the new API endpoint
      const response = await axiosInstance.get(`/visit/${id}/${visitId}/send-summary`, { method });
      const msg = response?.data?.message || `Summary sent via ${method.toUpperCase()}`;
      toast.success(msg);
      // On success, set visit status to completed
      setVisits(prevVisits => prevVisits.map(visit =>
        visit.id === visitId ? { ...visit, status: 'completed' } : visit
      ));
    } catch (error) {
      console.error(`Failed to send summary via ${method}:`, error);
      toast.error(`Failed to send summary via ${method.toUpperCase()}. Please try again.`);
      // On failure, do NOT change status (remains pending)
    } finally {
      setSendingNotification(null);
    }
  };

  useEffect(() => {
    if (id) fetchVisits();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'summaries' && visits.length > 0) {
      fetchAllSummaries();
    }
  }, [activeTab, visits]);

  const handleStartRecording = () => {
    setShowMicDialog(true);
  };

  const confirmStartRecording = async () => {
    setShowMicDialog(false);
    setAudioBlob(null);
    setIsRecording(true);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        
        // Get S3 presigned URL
        try {
          const fileName = `audio${Date.now()}`;
          const fileType = 'mp3';
          const presignRes = await axiosInstance.post("/visit/get-presigned-url", { fileName, fileType });
          setS3UploadUrl(presignRes.data.uploadUrl);
          setS3FileKey(presignRes.data.fileKey);
        } catch (err) {
          setS3UploadUrl(null);
          setS3FileKey(null);
          toast.error('Failed to get S3 upload URL.');
        }
      };
      
      mediaRecorder.start();
    } catch (err) {
      toast.error("Microphone access denied or not available.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUploadAudio = async () => {
  if (!audioBlob || !s3UploadUrl || !s3FileKey) return;
  setUploading(true);

  try {
    // Convert webm → mp3
    const mp3Blob = await convertWebmToMp3(audioBlob);
    const mp3File = new File([mp3Blob], `audio-${Date.now()}.mp3`, { type: "audio/mp3" });

    // Upload with axios
    await axios.put(s3UploadUrl, mp3File, {
      headers: { "Content-Type": "audio/mp3" },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (e) => {
        const percent = Math.round((e.loaded * 100) / e.total);
        console.log(`Upload progress: ${percent}%`);
      },
    });

    // API call after upload
    const patientId = String(patient?.id ?? id ?? "");
    const payload = {
      patient_id: patientId,
      visit_date: new Date().toISOString(),
      audio_file_url: s3FileKey,
      status: "pending",
      key: s3FileKey,
    };

    await axiosInstance.post("/visit/start", payload);
    toast.success("Audio uploaded successfully!");
    fetchVisits();
    setAudioBlob(null);
  } catch (err) {
    console.error("Upload error:", err);
    toast.error("Audio upload failed!");
  } finally {
    setUploading(false);
  }
};


  return (
    <div className="min-h-screen mt-14 bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Left Sidebar - Hidden on mobile, side-by-side on desktop */}
        <div className="lg:w-80 bg-white border-r border-gray-200 lg:h-screen lg:overflow-y-auto">
          <div className="p-4 lg:p-6">
            {/* Doctor Profile */}
            <div className="text-center mb-6 lg:mb-8">
              <Avatar className="h-16 w-16 lg:h-24 lg:w-24 mx-auto mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-orange-200 text-orange-800 text-lg">
                  <User className="h-6 w-6 lg:h-8 lg:w-8" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">{doctor.name || 'Loading...'}</h3>
              <p className="text-sm text-green-600 font-medium">{doctor.specialization || ''}</p>
            </div>

            {/* Patient Info */}
            <div className="mb-6 lg:mb-8">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Patient Info</h3>
              {patient ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{patient.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Age</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{patient.age || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{patient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{patient.phone_number || patient.contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Loading patient information...</p>
              )}
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-base lg:text-lg text-gray-500 mb-1">Medical History</h3>
              {patient ? (
                <div className="space-y-4">
                  <div>
                    
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{patient.medical_history || 'No medical history available'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Loading medical history...</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{patient?.name || 'Loading...'}</h1>
              <p className="text-green-600 font-medium mt-1 text-sm lg:text-base">Patient ID: {patient?.id || id}</p>
            </div>
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                className="bg-green-500 hover:bg-green-600 text-white px-4 lg:px-6 py-2 rounded-lg flex items-center gap-2 font-medium text-sm lg:text-base"
              >
                <Mic size={16} className="lg:w-[18px] lg:h-[18px]" />
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={handleStopRecording} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 lg:px-6 py-2 rounded-lg flex items-center gap-2 font-medium text-sm lg:text-base"
              >
                <StopCircle size={16} className="lg:w-[18px] lg:h-[18px]" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Recording Status Indicator */}
          {isRecording && (
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 font-semibold text-sm lg:text-base">Recording in progress...</span>
              </div>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 lg:h-10 w-full sm:w-auto" />
                </div>
                <Button 
                  onClick={handleUploadAudio} 
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm lg:text-base"
                >
                  <UploadCloud size={16} className="mr-2 lg:w-[18px] lg:h-[18px]" />
                  {uploading ? 'Uploading...' : 'Upload Audio'}
                </Button>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-sm lg:max-w-md grid-cols-2 mb-4 lg:mb-6">
              <TabsTrigger 
                value="transcriptions"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-900 text-sm lg:text-base"
              >
                Transcriptions
              </TabsTrigger>
              <TabsTrigger 
                value="summaries"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-sm lg:text-base"
              >
                Summaries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcriptions" className="mt-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 min-h-96">
                {visitsLoading ? (
                  <div className="flex items-center justify-center mt-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : visits.length > 0 ? (
                  <div className="space-y-6">
                    {visits.map((visit) => {
                      const summaryData = visitSummaries[visit.id];
                      return (
                        <Card key={visit.id} className="border-l-4 border-l-green-500">
                          <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <CardTitle className="text-base lg:text-lg text-gray-900">
                                Visit #{visit.id}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2">
                                {visit.transcript_text && (
                                  <Button
                                    onClick={() => handleUpdateTranscript(visit)}
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs lg:text-sm"
                                  >
                                    <Edit3 size={12} className="mr-1 lg:w-[14px] lg:h-[14px]" />
                                     Approve Transcript
                                  </Button>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {visit.status}
                                </span>
                                <span className="text-xs lg:text-sm text-gray-500">
                                  {new Date(visit.visit_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {visit.language && (
                              <p className="text-xs lg:text-sm text-gray-600 mt-2">
                                Language: <span className="capitalize">{visit.language}</span>
                              </p>
                            )}
                          </CardHeader>
                          <CardContent>
                            {visit.transcript_text ? (
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-3 lg:p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">Transcription:</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap text-sm lg:text-base">{visit.transcript_text}</p>
                                </div>
                                {/* Update and Approve Button */}
                                {summaryData && (
                                  <div className="flex justify-end">
                                    
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic text-sm lg:text-base">No transcription available for this visit.</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center mt-12">No transcriptions available yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="summaries" className="mt-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 min-h-96">
                {summariesLoading ? (
                  <div className="flex items-center justify-center mt-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600 text-sm lg:text-base">Loading summaries...</span>
                  </div>
                ) : visits.length > 0 ? (
                  <div className="space-y-4 lg:space-y-6">
                    {visits.map((visit) => {
                      const summaryData = visitSummaries[visit.id];
                      // Use visitSummaries for approval logic (show send buttons if approved), but status for badge
                      const isLocallyApproved = visitSummaries[visit.id]?.approved === true;
                      const isBackendApproved = visit.status === 'approved' || visit.status === 'completed';
                      return (
                        <Card key={visit.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <CardTitle className="text-base lg:text-lg text-gray-900">
                                Visit #{visit.id} Summary
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Edit Summary button - always show if summary exists and not locally approved */}
                                {!isLocallyApproved && summaryData && (
                                  <Button
                                    type="button"
                                    onClick={() => handleUpdateAndApprove(visit)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm"
                                  >
                                    <Edit3 size={12} className="mr-1 lg:w-[14px] lg:h-[14px]" />
                                    Edit Summary
                                  </Button>
                                )}
                                {/* Show send buttons only if locally approved */}
                                {isLocallyApproved && (
                                  <Button
                                    onClick={async () => {
                                      // Send both email and sms
                                      await handleSendSummary(visit.id, 'email');
                                      await handleSendSummary(visit.id, 'sms');
                                    }}
                                    disabled={sendingNotification === visit.id}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                                  >
                                    <Send size={14} className="mr-1" />
                                    {sendingNotification === visit.id ? 'Sending...' : 'Send via Email & SMS'}
                                  </Button>
                                )}
                                {/* Status badge */}
                                {isLocallyApproved ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Approved
                                  </span>
                                ) : summaryData ? (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    pending
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    no summary
                                  </span>
                                )}
                                <span className="text-sm text-gray-500">
                                  {new Date(visit.visit_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {summaryData ? (
                              <div className="space-y-4">
                                {/* Summary */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium text-gray-900 mb-2">Summary:</h4>
                                  <p className="text-gray-700 leading-relaxed">{summaryData.summary}</p>
                                </div>
                                
                                {/* Remedy */}
                                {summaryData.remedy && (
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Remedy & Recommendations:</h4>
                                    <p className="text-gray-700 leading-relaxed">{summaryData.remedy}</p>
                                  </div>
                                )}
                                
                                {/* Perception Tags */}
                                {summaryData.perception_tag && summaryData.perception_tag.length > 0 && (
                                  <div className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {summaryData.perception_tag.map((tag, index) => (
                                        <span 
                                          key={index}
                                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : visit.transcript_text ? (
                              <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-yellow-700">
                                  <span className="font-medium">Processing:</span> Summary is being generated from the transcription.
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No summary available for this visit.</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center mt-12">No summaries available yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Microphone Permission Dialog */}
      <Dialog open={showMicDialog} onOpenChange={setShowMicDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Allow Microphone Access</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              To record audio, we need access to your microphone. 
              Would you like to start recording now?
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowMicDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmStartRecording} 
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              Start Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Transcript Dialog */}
      <Dialog open={!!editingTranscript} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Update Transcript - Visit #{editingTranscript?.id}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4 text-sm lg:text-base">
              Edit the transcript text for this visit. Make your changes and click save to update.
            </p>
            <Textarea
              value={editTranscriptText}
              onChange={(e) => setEditTranscriptText(e.target.value)}
              placeholder="Enter transcript text here..."
              className="min-h-48 lg:min-h-64 p-3 lg:p-4 text-gray-600 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm lg:text-base"
            />
            <p className="text-xs lg:text-sm text-gray-500 mt-2">
              Visit Date: {editingTranscript && new Date(editingTranscript.visit_date).toLocaleDateString()}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelEdit}
              disabled={updatingTranscript}
              className="w-full sm:flex-1 text-sm lg:text-base"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTranscript}
              disabled={updatingTranscript || !editTranscriptText.trim()}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:flex-1 text-sm lg:text-base"
            >
              {updatingTranscript ? 'Updating...' : 'Save Transcript'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Summary Dialog */}
      <Dialog open={!!editingSummary} onOpenChange={(open) => !open && handleCancelSummaryEdit()}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg lg:text-xl">Edit Summary - Visit #{editingSummary?.id}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <p className="text-gray-600 text-sm lg:text-base">
              Edit the summary details below. All changes will be saved and the summary will be approved.
            </p>
            
            {/* Summary Section */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-sm font-medium text-gray-700">
                Summary
              </Label>
              <Textarea
                id="summary"
                value={editSummaryData.summary}
                onChange={(e) => setEditSummaryData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Enter summary text here..."
                className="min-h-32 p-3 text-gray-600 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Remedy Section */}
            <div className="space-y-2">
              <Label htmlFor="remedy" className="text-sm font-medium text-gray-700">
                Remedy & Recommendations
              </Label>
              <Textarea
                id="remedy"
                value={editSummaryData.remedy}
                onChange={(e) => setEditSummaryData(prev => ({ ...prev, remedy: e.target.value }))}
                placeholder="Enter remedy and recommendations here..."
                className="min-h-32 p-3 text-gray-600 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                Tags
              </Label>
              <Input
                id="tags"
                value={editSummaryData.perception_tag.join(', ')}
                onChange={(e) => handleTagInput(e.target.value)}
                placeholder="Enter tags separated by commas (e.g., diabetes, hypertension, follow-up)"
                className="p-3 text-gray-600 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500">
                Separate tags with commas. Current tags: {editSummaryData.perception_tag.length}
              </p>
              {editSummaryData.perception_tag.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editSummaryData.perception_tag.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Visit Date: {editingSummary && new Date(editingSummary.visit_date).toLocaleDateString()}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelSummaryEdit}
              disabled={updatingSummary}
              className="w-full sm:flex-1 text-sm lg:text-base"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSummary}
              disabled={updatingSummary || !editSummaryData.summary.trim()}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:flex-1 text-sm lg:text-base"
            >
              <CheckCircle size={16} className="mr-2" />
              {updatingSummary ? 'Updating...' : 'Update & Approve Summary'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}