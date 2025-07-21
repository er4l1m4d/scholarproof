"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/app/supabaseClient";
import CertificateTemplate from "@/app/components/CertificateTemplate";
import { exportCertificate } from "@/utils/exportCertificate";
import { uploadToIrys, IrysUploadResult } from "@/utils/uploadToIrys";
import { saveCertificateToSupabase } from "@/utils/saveCertificateToSupabase";

const schema = z.object({
  studentId: z.string().uuid({ message: "Student is required" }),
  sessionId: z.string().uuid({ message: "Session is required" }),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  dateIssued: z.string().min(1, "Date issued is required"),
});

type FormData = z.infer<typeof schema>;

// Define explicit types for students and sessions
interface Student {
  id: string;
  full_name: string;
}
interface Session {
  id: string;
  name: string;
}

export default function NewCertificatePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<FormData | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  // Removed exporting and setExporting
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<IrysUploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // Removed reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dateIssued: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch students
        const { data: studentsData, error: studentsError } = await supabase
          .from("users")
          .select("id, full_name")
          .eq("role", "student");
        if (studentsError) throw studentsError;
        setStudents((studentsData as Student[]) || []);

        // Fetch sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("sessions")
          .select("id, name");
        if (sessionsError) throw sessionsError;
        setSessions((sessionsData as Session[]) || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = (data: FormData) => {
    setPreviewData(data);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  if (previewData) {
    const handleDownloadPDF = async () => {
      if (!certificateRef.current) return;
      const blob = await exportCertificate(certificateRef.current, "pdf");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.pdf";
      a.click();
      URL.revokeObjectURL(url);
    };

    const handleUploadToIrys = async () => {
      if (!certificateRef.current) return;
      setUploading(true);
      setUploadError(null);
      setUploadResult(null);
      try {
        const blob = await exportCertificate(certificateRef.current, "pdf");
        const result = await uploadToIrys(blob);
        setUploadResult(result);
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    };

    const handleSaveToSupabase = async () => {
      if (!uploadResult) return;
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        const { error } = await saveCertificateToSupabase({
          student_id: previewData.studentId,
          session_id: previewData.sessionId,
          title: previewData.title,
          description: previewData.description,
          irys_url: uploadResult.irys_url,
          revoked: false,
        });
        if (error) throw error;
        setSaveSuccess(true);
      } catch (err: unknown) {
        setSaveError(err instanceof Error ? err.message : "Failed to save to Supabase");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Certificate Preview</h1>
        <div ref={certificateRef}>
          <CertificateTemplate
            studentName={
              students.find((s) => s.id === previewData.studentId)?.full_name || "Student Name"
            }
            title={previewData.title}
            description={previewData.description}
            dateIssued={previewData.dateIssued}
          />
        </div>
        <div className="flex gap-4 mt-8">
          <button
            className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300"
            onClick={() => setPreviewData(null)}
            disabled={uploading}
          >
            Back to Edit
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
            onClick={handleDownloadPDF}
            disabled={uploading}
          >
            Download PDF
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
            onClick={handleUploadToIrys}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload to Irys"}
          </button>
        </div>
        {uploadError && <div className="mt-4 text-red-600">{uploadError}</div>}
        {uploadResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <div className="font-semibold text-green-700 mb-2">Upload Successful!</div>
            <div>
              <span className="font-medium">Irys URL:</span>{" "}
              <a href={uploadResult.irys_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">{uploadResult.irys_url}</a>
            </div>
            <div>
              <span className="font-medium">Transaction ID:</span>{" "}
              <span className="break-all">{uploadResult.transaction_id}</span>
            </div>
            <button
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 disabled:opacity-60"
              onClick={handleSaveToSupabase}
              disabled={saving || saveSuccess}
            >
              {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save to Supabase"}
            </button>
            {saveError && <div className="mt-2 text-red-600">{saveError}</div>}
            {saveSuccess && <div className="mt-2 text-green-700">Certificate metadata saved to Supabase!</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Issue New Certificate</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Student Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Student</label>
          <select {...register("studentId")} className="w-full border rounded px-3 py-2">
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.full_name || student.id}
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-red-500 text-sm">{errors.studentId.message}</p>}
        </div>
        {/* Session Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Session</label>
          <select {...register("sessionId")} className="w-full border rounded px-3 py-2">
            <option value="">Select session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
          {errors.sessionId && <p className="text-red-500 text-sm">{errors.sessionId.message}</p>}
        </div>
        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            {...register("title")}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Bachelor of Science in Computer Science"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full border rounded px-3 py-2"
            placeholder="Optional description"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        {/* Date Issued */}
        <div>
          <label className="block mb-1 font-medium">Date Issued</label>
          <input
            type="date"
            {...register("dateIssued")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.dateIssued && <p className="text-red-500 text-sm">{errors.dateIssued.message}</p>}
        </div>
        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Preview Certificate
        </button>
      </form>
    </div>
  );
} 