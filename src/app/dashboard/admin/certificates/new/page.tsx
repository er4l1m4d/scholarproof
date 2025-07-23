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

export default function NewCertificatePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    watch,
    handleSubmit,
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
    // TODO: Implement preview/submit logic
    alert(JSON.stringify(data, null, 2));
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="p-6 md:p-10 border-r border-gray-100">
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
              Preview & Continue
            </button>
          </form>
        </div>
        {/* Right: Live Preview */}
        <div className="p-6 md:p-10 flex flex-col items-center justify-center bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-center">Live Certificate Preview</h2>
          <div className="w-full max-w-xl">
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
  );
} 