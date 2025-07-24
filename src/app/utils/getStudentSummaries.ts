import { supabase } from '../supabaseClient';

export async function getStudentSummaries() {
  // Fetch students with certificate counts
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, certificates(count)')
    .eq('role', 'student')
    .order('name', { ascending: true });
  if (error) throw error;
  // Map to a friendlier format
  return (data || []).map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    certCount: student.certificates?.length > 0 ? student.certificates[0].count : 0,
  }));
} 