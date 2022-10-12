import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const CONTRACTS_TABLE_NAME = 'contracts';
export const CONTRACTS_METADATA_TABLE_NAME = 'contracts_metadata';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
