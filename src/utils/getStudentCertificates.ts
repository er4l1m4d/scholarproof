import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export async function getStudentCertificates(studentId: string) {
  const supabase = createPagesBrowserClient();
  const { data, error } = await supabase
    .from('certificates')
    .select('*, sessions(*)')
    .eq('student_id', studentId)
    .eq('revoked', false);
  if (error) throw error;
  return data;
} 