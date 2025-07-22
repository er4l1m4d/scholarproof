import { supabase } from '../supabaseClient';

export async function getSessionSummaries() {
  // Fetch sessions with certificate counts
  const { data, error } = await supabase
    .from('sessions')
    .select('id, name, created_at, certificates(count)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Map to a friendlier format
  return (data || []).map(session => ({
    id: session.id,
    name: session.name,
    created_at: session.created_at,
    certCount: session.certificates?.length > 0 ? session.certificates[0].count : 0,
  }));
} 