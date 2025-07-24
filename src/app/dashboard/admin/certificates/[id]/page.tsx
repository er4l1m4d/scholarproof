"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/supabaseClient";
import CertificateTemplate from "@/app/components/CertificateTemplate";

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

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch certificate
        const { data, error } = await supabase
          .from("certificates")
          .select("*, student:student_id(name), sessions:session_id(name)")
          .eq("id", id)
          .single();
        if (error || !data) throw error || new Error("Certificate not found");
        setCertificate({
          ...data,
          student_name: data.student?.name,
          session_name: data.sessions?.name,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch certificate");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCertificate();
  }, [id]);

  const handleToggleRevoke = async () => {
    if (!certificate) return;
    setToggling(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("certificates")
        .update({ revoked: !certificate.revoked })
        .eq("id", certificate.id);
      if (error) throw error;
      setCertificate({ ...certificate, revoked: !certificate.revoked });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!certificate) return <div className="p-8">Certificate not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Certificate Details</h1>
      <CertificateTemplate
        studentName={certificate.student_name || certificate.student_id}
        title={certificate.title}
        description={certificate.description}
        dateIssued={certificate.uploaded_at}
        revoked={certificate.revoked}
        sessionName={certificate.session_name}
      />
      <div className="flex gap-4 mt-8 items-center">
        <button
          className={`px-4 py-2 rounded font-semibold transition text-white ${certificate.revoked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
          onClick={handleToggleRevoke}
          disabled={toggling}
        >
          {toggling
            ? "Updating..."
            : certificate.revoked
            ? "Restore Certificate"
            : "Revoke Certificate"}
        </button>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${certificate.revoked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {certificate.revoked ? "REVOKED" : "ACTIVE"}
        </span>
        <a
          href={certificate.irys_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-blue-700 underline break-all"
        >
          View on Irys
        </a>
      </div>
    </div>
  );
}