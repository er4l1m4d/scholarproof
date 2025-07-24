"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/supabaseClient";

interface Certificate {
  id: string;
  student_id: string;
  session_id: string;
  title: string;
  description?: string;
  irys_url: string;
  revoked: boolean;
  uploaded_at: string;
  student_name?: string;
  session_name?: string;
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*, students:student_id(full_name), sessions:session_id(name)")
          .order("uploaded_at", { ascending: false });
        if (error) throw error;
        setCertificates(
          (data || []).map((cert: any) => ({
            ...cert,
            student_name: cert.students?.full_name,
            session_name: cert.sessions?.name,
          }))
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch certificates");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">All Certificates</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : certificates.length === 0 ? (
        <div>No certificates found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">Student</th>
                <th className="py-2 px-4">Session</th>
                <th className="py-2 px-4">Title</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{cert.student_name || cert.student_id}</td>
                  <td className="py-2 px-4">{cert.session_name || cert.session_id}</td>
                  <td className="py-2 px-4">{cert.title}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${cert.revoked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {cert.revoked ? "Revoked" : "Active"}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <Link
                      href={`/dashboard/admin/certificates/${cert.id}`}
                      className="text-blue-700 underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 