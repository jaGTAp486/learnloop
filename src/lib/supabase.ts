import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const EDGE_FUNCTION_URL = supabaseUrl
  ? `${supabaseUrl}/functions/v1/ai-tutor`
  : null;

export const HAS_SUPABASE = Boolean(supabaseUrl && supabaseAnonKey);
