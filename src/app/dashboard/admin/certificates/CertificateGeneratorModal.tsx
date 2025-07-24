"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/app/supabaseClient";
import CertificateTemplate from "@/app/components/CertificateTemplate";

const schema = z.object({
  studentId: z.string().uuid({ message: "Student is required" }),
  sessionId: z.string().uuid({ message: "Session is required" }),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  dateIssued: z.string().min(1, "Date issued is required"),
  uploadToIrys: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

interface Student {
  id: string;
  full_name: string;
}
interface Session {
  id: string;
  name: string;
}

interface CertificateGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({ open, onClose, onSuccess }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed previewContainerRef, certRef, and scale state

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dateIssued: new Date().toISOString().slice(0, 10),
      uploadToIrys: false,
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  // Removed dynamic scaling effect useEffect

  const onSubmit = (data: FormData) => {
    // TODO: Implement actual certificate creation logic
    onSuccess();
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] mx-4 relative flex flex-col">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={() => { reset(); onClose(); }}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10 overflow-auto">
          {/* Left: Form */}
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold mb-6">Issue New Certificate</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500 mb-4">{error}</div>
            ) : (
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
                {/* Upload to Irys Checkbox */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register("uploadToIrys")} id="uploadToIrys" />
                  <label htmlFor="uploadToIrys" className="font-medium">Upload to Irys after preview?</label>
                </div>
                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                >
                  Create Certificate
                </button>
              </form>
            )}
          </div>
          {/* Right: Live Preview */}
          <div className="flex flex-col items-center justify-center bg-gray-50 min-h-[400px] h-[500px] md:h-[600px]">
            <h2 className="text-xl font-semibold mb-4 text-center">Live Certificate Preview</h2>
            <div className="relative w-full h-[500px] border rounded-lg bg-white overflow-hidden">
              <div className="absolute top-1/2 left-1/2 origin-center scale-[0.6] -translate-x-1/2 -translate-y-1/2">
                <CertificateTemplate
                  studentName={
                    students.find((s) => s.id === formValues.studentId)?.full_name || "Student Name"
                  }
                  title={formValues.title || "Certificate Title"}
                  description={formValues.description || "Certificate description will appear here."}
                  dateIssued={formValues.dateIssued || new Date().toISOString()}
                  revoked={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGeneratorModal; 