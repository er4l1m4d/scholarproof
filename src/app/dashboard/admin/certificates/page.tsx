"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/supabaseClient";
import DashboardLayout from "@/app/components/DashboardLayout";
import CertificateGeneratorModal from "./CertificateGeneratorModal";
import useSWR, { mutate } from "swr";

interface Certificate {
  id: string;
  student_id: string;
  session_id: string;
  title: string;
  description?: string;
  irys_url: string;
  revoked: boolean;
  uploaded_at: string;
  users?: { name?: string };
  sessions?: { name?: string };
}

const fetcher = async (url: string): Promise<Certificate[]> => {
  const { data, error } = await supabase
    .from("certificates")
    .select("*, users(name), sessions:session_id(name)")
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export default function AdminCertificatesPage() {
  const { data: certificates = [], error, isLoading } = useSWR<Certificate[]>("certificates", fetcher);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <DashboardLayout role="admin">
      <CertificateGeneratorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => mutate("certificates")}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Certificates</h1>
          <div className="flex gap-2">
            <button
              onClick={() => mutate("certificates")}
              className="bg-gray-200 px-3 py-2 rounded font-semibold hover:bg-gray-300 transition"
            >
              Refresh Table
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
            >
              + New Certificate
            </button>
          </div>
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error.message || error.toString()}</div>
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
                  <th className="py-2 px-4">Date Issued</th>
                  <th className="py-2 px-4">Irys URL</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert: Certificate) => (
                  <tr key={cert.id} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{cert.users?.name || cert.student_id}</td>
                    <td className="py-2 px-4">{cert.sessions?.name || cert.session_id}</td>
                    <td className="py-2 px-4">
                      <Link href={`/dashboard/admin/certificates/${cert.id}`} className="text-blue-700 underline font-medium">
                        {cert.title}
                      </Link>
                    </td>
                    <td className="py-2 px-4">{cert.uploaded_at ? new Date(cert.uploaded_at).toLocaleDateString() : ''}</td>
                    <td className="py-2 px-4">
                      {cert.irys_url ? (
                        <a href={cert.irys_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">Irys Link</a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${cert.revoked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {cert.revoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className="py-2 px-4 flex gap-2 items-center">
                      <Link
                        href={`/dashboard/admin/certificates/${cert.id}`}
                        className="text-blue-700 underline font-medium"
                      >
                        View
                      </Link>
                      {!cert.irys_url && !cert.revoked && (
                        <button
                          className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-purple-700 transition"
                          onClick={async () => {
                            // Call API or function to upload to Irys (implement as needed)
                            // After upload, revalidate
                            alert('Upload to Irys not yet implemented.');
                          }}
                        >
                          Upload to Irys
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 