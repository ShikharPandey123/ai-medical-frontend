"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Mic, StopCircle, UploadCloud } from "lucide-react"
import { User } from "lucide-react"
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
import axiosInstance from "../../../../lib/axiosInstance"
import { convertWebmToMp3 } from "../../../../lib/audioConvert"

export default function PatientDetailPage({ params }) {
  const router = useRouter();
  const { id } = React.use(params)
  const [patient, setPatient] = useState();

  const [doctor, setDoctor] = useState({ name: '', specialization: '' });
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

  const [visits, setVisits] = useState([]);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitsLoading, setVisitsLoading] = useState(false);

  // Audio recording state
  const [showMicDialog, setShowMicDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [s3UploadUrl, setS3UploadUrl] = useState(null);
  const [s3FileKey, setS3FileKey] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
    fetchPatientData();
  }, [id]);

  useEffect(() => {
    const fetchVisits = async () => {
      setVisitsLoading(true);
      try {
        // Use the new API endpoint for visit history
        const res = await axiosInstance.get(`/api/v1/visit/1/visit-history`);
        let apiVisits = res.data && Array.isArray(res.data) ? res.data : [];
        // Merge with local visits
        const localVisits = JSON.parse(localStorage.getItem('localVisits') || '[]');
        // Only show local visits for this patient
        const filteredLocal = localVisits.filter(v => v.patient_id == id);
        setVisits([...filteredLocal, ...apiVisits]);
      } catch (err) {
        // If API fails, show only local visits
        const localVisits = JSON.parse(localStorage.getItem('localVisits') || '[]');
        const filteredLocal = localVisits.filter(v => v.patient_id == id);
        setVisits(filteredLocal);
      } finally {
        setVisitsLoading(false);
      }
    };
    if (id) fetchVisits();
  }, [id]);

  const handleStartRecording = () => {
    setShowMicDialog(true);
  };

  const confirmStartRecording = async () => {
    setShowMicDialog(false);
    setUploadResult(null);
    setAudioBlob(null);
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
    } catch (err) {
      alert("Microphone access denied or not available.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Prepare for S3 upload: get presigned URL for mp3
      try {
        const fileName = `audio${Date.now()}`;
        const fileType = 'mp3';
        const presignRes = await axiosInstance.post("/visit/get-presigned-url", { fileName, fileType });
        setS3UploadUrl(presignRes.data.uploadUrl);
        setS3FileKey(presignRes.data.fileKey);
      } catch (err) {
        setS3UploadUrl(null);
        setS3FileKey(null);
        setUploadResult({ error: 'Failed to get S3 upload URL.' });
      }
    }
  };

  const handleUploadAudio = async () => {
    if (!audioBlob || !s3UploadUrl || !s3FileKey) return;
    setUploading(true);
    setUploadResult(null);
    try {
      // Convert webm to mp3 using ffmpeg.wasm
      const mp3Blob = await convertWebmToMp3(audioBlob);
      // Step 2: Upload mp3 audio to S3 using axios
      await axiosInstance.put(s3UploadUrl, mp3Blob, {
        headers:
        {
          'Content-Type': 'audio/mp3',
        },
        baseURL: '',
      });

      // Step 3: Notify backend with file key
      const apiRes = await axiosInstance.post('/visit/start', {
        patient_id: patient?.id,
        audio_url: s3FileKey,
      });
      setUploadResult(apiRes.data);
    } catch (err) {
      // S3 upload failed, save to localStorage as dummy visit
      try {
        const dummyId = Date.now();
        const dummyVisit = {
          id: dummyId,
          patient_id: patient?.id,
          visit_date: new Date().toISOString(),
          doctor_id: 1,
          key: `dummy-audio-${dummyId}.mp3`,
          audio_file_url: '',
          status: 'pending',
          transcript_text: '',
          language: 'en',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isLocal: true,
        };
        // Save audio blob as base64 in localStorage
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64Audio = e.target.result;
          localStorage.setItem(`dummy-audio-${dummyId}`, base64Audio);
          // Save dummy visit
          const localVisits = JSON.parse(localStorage.getItem('localVisits') || '[]');
          localVisits.push(dummyVisit);
          localStorage.setItem('localVisits', JSON.stringify(localVisits));
          setUploadResult({ ...dummyVisit, audio_file_url: base64Audio });
          // Optionally, refresh visits
          setVisits((prev) => [dummyVisit, ...prev]);
        };
        reader.readAsDataURL(audioBlob);
      } catch (e) {
        setUploadResult({ error: 'Upload failed and could not save locally.' });
      }
    } finally {
      setUploading(false);
    }
  };

  // const handleSaveNotes = async () => {
  //   try {
  //     await axiosInstance.post(`/patients/${params.id}/notes`, {
  //       notes: consultationNotes,
  //     })
  //     console.log("Notes saved successfully")
  //   } catch (error) {
  //     console.error("Failed to save notes:", error)
  //   }
  // }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Patient Info */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          {/* Doctor Profile */}
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-4">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Doctor" />
              <AvatarFallback className="bg-gray-200 text-gray-600 text-lg">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {/* TODO: Replace with logged-in doctor info from backend/auth context */}
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-green-600">{doctor.specialization}</p>
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
                  <p className="font-medium">{patient?.name || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{patient?.age || ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patient?.gender || ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{patient?.phone_number || patient?.contact || ''}</p>
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
                <p className="text-sm">{patient?.medical_history || 'No medical history available.'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Consultations */}
          {/* <Card>
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
          </Card> */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="p-8">
          {/* Patient Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient?.name || ''}</h1>
              <p className="text-green-600 mt-1">Patient ID: {patient?.id || ''}</p>
            </div>
            <Button
              onClick={handleStartRecording}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 flex items-center gap-2"
            >
              <Mic size={18} /> Start Recording
            </Button>
          </div>

          {/* Microphone Confirm Dialog */}
          <Dialog open={showMicDialog} onOpenChange={setShowMicDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Allow Microphone Access?</DialogTitle>
              </DialogHeader>
              <div className="py-4">To record audio, we need access to your microphone. Start recording now?</div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMicDialog(false)}>Cancel</Button>
                <Button onClick={confirmStartRecording} className="bg-green-600 text-white">Start</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Audio Recording Controls */}
          {isRecording && (
            <div className="mb-6 flex items-center gap-4">
              <span className="text-red-600 font-semibold">Recording...</span>
              <Button onClick={handleStopRecording} className="bg-red-600 text-white flex items-center gap-2">
                <StopCircle size={18} /> Stop Recording
              </Button>
            </div>
          )}
          {audioBlob && !isRecording && (
            <div className="mb-6 flex items-center gap-4">
              <audio controls src={URL.createObjectURL(audioBlob)} />
              <Button onClick={handleUploadAudio} disabled={uploading} className="bg-blue-600 text-white flex items-center gap-2">
                <UploadCloud size={18} /> {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          )}
          {uploadResult && (
            <div className="mb-6">
              {uploadResult.error ? (
                <span className="text-red-600">{uploadResult.error}</span>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-4 overflow-x-auto">
                  <div className="font-semibold mb-2">Audio Uploaded!</div>
                  <div className="flex flex-col gap-1">
                    <div>
                      <strong>Audio URL:</strong>
                      <span className="block break-all max-w-full">
                        <a href={uploadResult.audio_file_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{uploadResult.audio_file_url}</a>
                      </span>
                    </div>
                    <div><strong>Status:</strong> {uploadResult.status}</div>
                    <div><strong>Key:</strong> {uploadResult.key}</div>
                    <div><strong>Visit Date:</strong> {uploadResult.visit_date ? new Date(uploadResult.visit_date).toLocaleString() : '-'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Visit History Table */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Visit History</h2>
            {visitsLoading ? (
              <div>Loading visits...</div>
            ) : (
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Visit Date</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push(`/dashboard/patients/${id}/visit?visitId=${visit.id}`)}
                    >
                      <td className="py-2 px-4 border-b align-middle">{new Date(visit.visit_date).toLocaleString()}</td>
                      <td className="py-2 px-4 border-b align-middle">{visit.status}</td>
                      <td className="py-2 px-4 border-b align-middle">
                        <Button
                          variant="link"
                          className="text-blue-600 hover:underline p-0 h-auto min-w-0"
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/dashboard/patients/${id}/visit?visitId=${visit.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {visits.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500">
                        No visits found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}