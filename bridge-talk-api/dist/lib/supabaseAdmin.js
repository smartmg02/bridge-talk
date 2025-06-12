"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('❌ Supabase URL 或 Service Role Key 未設定');
}
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, serviceRoleKey);
