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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      const res = await axiosInstance.get(`/visit/${patientId}/${visitId}/summary`);
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
      
      alert('Transcript updated successfully!');
      setEditingTranscript(null);
      setEditTranscriptText("");
    } catch (error) {
      console.error('Failed to update transcript:', error);
      alert('Failed to update transcript. Please try again.');
    } finally {
      setUpdatingTranscript(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTranscript(null);
    setEditTranscriptText("");
  };

  const handleApproveSummary = async (visitId) => {
    setApprovingSummary(visitId);
    try {
      // Get the summary data from the visitSummaries state
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

      const response = await axiosInstance.put(`/visit/approved-summary/${visitId}`, requestBody);
      toast.success('Summary approved successfully!');
      
      // Refresh the summaries to get updated approval status from backend
      await fetchAllSummaries();
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

      const requestBody = {
        patient_id: patient.id,
        visit_id: visitId,
        method: method, // 'email' or 'sms'
        summary_text: summaryData.summary,
        remedy: summaryData.remedy,
        perception_tag: summaryData.perception_tag || []
      };

      // You'll need to replace this endpoint with your actual API endpoint
      const response = await axiosInstance.post(`/visit/send-summary`, requestBody);
      
      toast.success(`Summary sent successfully via ${method.toUpperCase()}!`);
    } catch (error) {
      console.error(`Failed to send summary via ${method}:`, error);
      toast.error(`Failed to send summary via ${method.toUpperCase()}. Please try again.`);
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
          alert('Failed to get S3 upload URL.');
        }
      };
      
      mediaRecorder.start();
    } catch (err) {
      alert("Microphone access denied or not available.");
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
      // Convert webm to mp3 using ffmpeg.wasm
      const mp3Blob = await convertWebmToMp3(audioBlob);
      
      // Upload mp3 audio to S3
      await axios.put(s3UploadUrl, mp3Blob, {
        headers: {
          'Content-Type': 'audio/mp3',
        }
      });

      const patientId = String(patient?.id ?? id ?? '');
      if (!patientId) {
        alert('Patient ID is missing.');
        setUploading(false);
        return;
      }

      const payload = {
        patient_id: patientId,
        visit_date: new Date().toISOString(),
        audio_file_url: s3FileKey,
        status: 'pending',
        key: s3FileKey,
      };
      
      const apiRes = await axiosInstance.post('/visit/start', payload);
      alert('Audio uploaded successfully!');
      fetchVisits(); // Refresh visit history
      setAudioBlob(null);
    } catch (err) {
      alert('Audio upload failed!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          <div className="p-6">
            {/* Doctor Profile */}
            <div className="text-center mb-8">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-orange-200 text-orange-800 text-lg">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-gray-900">{doctor.name || 'Loading...'}</h3>
              <p className="text-sm text-green-600 font-medium">{doctor.specialization || ''}</p>
            </div>

            {/* Patient Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Info</h3>
              {patient ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{patient.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Age</p>
                      <p className="font-medium text-gray-900">{patient.age || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-medium text-gray-900">{patient.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact</p>
                      <p className="font-medium text-gray-900">{patient.phone_number || patient.contact || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading patient information...</p>
              )}
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History</h3>
              {patient ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Medical History</p>
                    <p className="font-medium text-gray-900">{patient.medical_history || 'No medical history available'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading medical history...</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient?.name || 'Loading...'}</h1>
              <p className="text-green-600 font-medium mt-1">Patient ID: {patient?.id || id}</p>
            </div>
            <Button
              onClick={handleStartRecording}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
              <Mic size={18} />
              Start Recording
            </Button>
          </div>

          {/* Audio Recording Controls */}
          {isRecording && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 font-semibold">Recording in progress...</span>
                </div>
                <Button 
                  onClick={handleStopRecording} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <StopCircle size={18} className="mr-2" />
                  Stop Recording
                </Button>
              </div>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <audio controls src={URL.createObjectURL(audioBlob)} className="h-10" />
                </div>
                <Button 
                  onClick={handleUploadAudio} 
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <UploadCloud size={18} className="mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Audio'}
                </Button>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger 
                value="transcriptions"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-900"
              >
                Transcriptions
              </TabsTrigger>
              <TabsTrigger 
                value="summaries"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                Summaries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcriptions" className="mt-0">
              <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-96">
                {visitsLoading ? (
                  <div className="flex items-center justify-center mt-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  </div>
                ) : visits.length > 0 ? (
                  <div className="space-y-6">
                    {visits.map((visit) => (
                      <Card key={visit.id} className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-gray-900">
                              Visit #{visit.id}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              {visit.transcript_text && (
                                <Button
                                  onClick={() => handleUpdateTranscript(visit)}
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <Edit3 size={14} className="mr-1" />
                                  Update
                                </Button>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visit.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(visit.visit_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {visit.language && (
                            <p className="text-sm text-gray-600">
                              Language: <span className="capitalize">{visit.language}</span>
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          {visit.transcript_text ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Transcription:</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{visit.transcript_text}</p>
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No transcription available for this visit.</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center mt-12">No transcriptions available yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="summaries" className="mt-0">
              <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-96">
                {summariesLoading ? (
                  <div className="flex items-center justify-center mt-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading summaries...</span>
                  </div>
                ) : visits.length > 0 ? (
                  <div className="space-y-6">
                    {visits.map((visit) => {
                      const summaryData = visitSummaries[visit.id];
                      return (
                        <Card key={visit.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg text-gray-900">
                                Visit #{visit.id} Summary
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {summaryData && (summaryData.approved === false || summaryData.approved === undefined || summaryData.status !== 'approved') && (
                                  <Button
                                    onClick={() => handleApproveSummary(visit.id)}
                                    disabled={approvingSummary === visit.id}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    {approvingSummary === visit.id ? 'Approving...' : 'Approve Summary'}
                                  </Button>
                                )}
                                {summaryData && (summaryData.approved === true || summaryData.status === 'approved') && (
                                  <>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Approved
                                    </span>
                                    <Button
                                      onClick={() => handleSendSummary(visit.id, 'email')}
                                      disabled={sendingNotification === visit.id}
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Send size={14} className="mr-1" />
                                      {sendingNotification === visit.id ? 'Sending...' : 'Send via Email'}
                                    </Button>
                                    <Button
                                      onClick={() => handleSendSummary(visit.id, 'sms')}
                                      disabled={sendingNotification === visit.id}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Send size={14} className="mr-1" />
                                      {sendingNotification === visit.id ? 'Sending...' : 'Send via SMS'}
                                    </Button>
                                  </>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {visit.status}
                                </span>
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
                                    <h4 className="font-medium text-gray-900 mb-3">Key Topics:</h4>
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
              To record audio consultation notes, we need access to your microphone. 
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
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Transcript - Visit #{editingTranscript?.id}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Edit the transcript text for this visit. Make your changes and click save to update.
            </p>
            <Textarea
              value={editTranscriptText}
              onChange={(e) => setEditTranscriptText(e.target.value)}
              placeholder="Enter transcript text here..."
              className="min-h-64 p-4 text-gray-600 placeholder:text-gray-400 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              Visit Date: {editingTranscript && new Date(editingTranscript.visit_date).toLocaleDateString()}
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelEdit}
              disabled={updatingTranscript}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTranscript}
              disabled={updatingTranscript || !editTranscriptText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              {updatingTranscript ? 'Updating...' : 'Save Transcript'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}