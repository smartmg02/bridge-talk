// bridge-talk-web/src/lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('❌ Supabase URL 或 Service Role Key 未設定');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
