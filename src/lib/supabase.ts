import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gtrifaxowpezwbjgrvuo.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_at_g4xhjX1bf8wt6daOpwA_OCZt33xD';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export interface SupabaseStatus {
  connected: boolean;
  projectUrl: string;
  projectId: string;
  hasUsersTable: boolean;
  hasRequestsTable: boolean;
  hasMessagesTable: boolean;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseStatus> {
  const result: SupabaseStatus = {
    connected: false,
    projectUrl: SUPABASE_URL,
    projectId: 'gtrifaxowpezwbjgrvuo',
    hasUsersTable: false,
    hasRequestsTable: false,
    hasMessagesTable: false
  };

  try {
    const { error: userErr } = await supabase.from('users').select('id').limit(1);
    if (!userErr) {
      result.connected = true;
      result.hasUsersTable = true;
    } else if (userErr.code === 'PGRST205') {
      result.connected = true; // Connected to Supabase, but schema not yet migrated
      result.hasUsersTable = false;
    }

    const { error: reqErr } = await supabase.from('vehicle_requests').select('id').limit(1);
    if (!reqErr) {
      result.hasRequestsTable = true;
    }

    const { error: msgErr } = await supabase.from('chat_messages').select('id').limit(1);
    if (!msgErr) {
      result.hasMessagesTable = true;
    }

    return result;
  } catch (err: any) {
    result.error = err?.message || 'Connection test failed';
    return result;
  }
}
