import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const CONTRACTS_TABLE_NAME = 'contracts';
export const CONTRACTS_METADATA_TABLE_NAME = 'contracts_metadata';
export const CONTRACTS_DYNAMIC_DATA_TABLE_NAME = 'contracts_dynamic_data';

export const SNS_PUBLISHER_RPC_NAME = 'sns-publisher';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
