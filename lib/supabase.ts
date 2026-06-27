import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jzvuqoxvcjkjjuujnlde.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_S9AI8Ngqiuvx-p-uj55-jA_l5hikgTN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);