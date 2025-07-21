import { supabase } from "@/app/supabaseClient";

export interface CertificateMetadata {
  student_id: string;
  session_id: string;
  title: string;
  description?: string;
  irys_url: string;
  revoked?: boolean;
  uploaded_at?: string;
}

export async function saveCertificateToSupabase(metadata: CertificateMetadata) {
  const { data, error } = await supabase
    .from("certificates")
    .insert([
      {
        student_id: metadata.student_id,
        session_id: metadata.session_id,
        title: metadata.title,
        description: metadata.description,
        irys_url: metadata.irys_url,
        revoked: metadata.revoked ?? false,
        uploaded_at: metadata.uploaded_at ?? new Date().toISOString(),
      },
    ])
    .select()
    .single();
  return { data, error };
} 