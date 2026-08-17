import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

// createClient() throws synchronously if the URL is empty. Since this file is imported
// at module load time (not inside a function), an unconfigured Supabase env previously
// crashed the entire app on launch before any component even rendered. Reporting/community
// map features are optional — their absence should degrade gracefully, not take the app down.
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    })
  : null;
