"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndTrackTokenUsage = checkAndTrackTokenUsage;
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const DAILY_LIMIT = 20000;
async function checkAndTrackTokenUsage(userEmail, tokensUsed) {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabaseAdmin_1.supabaseAdmin
        .from('token_usage')
        .select('tokens_used')
        .eq('user_email', userEmail)
        .eq('date', today)
        .single();
    const currentUsed = data?.tokens_used ?? 0;
    const totalUsed = currentUsed + tokensUsed;
    if (totalUsed > DAILY_LIMIT) {
        return { allowed: false, remaining: DAILY_LIMIT - currentUsed };
    }
    if (data) {
        await supabaseAdmin_1.supabaseAdmin
            .from('token_usage')
            .update({ tokens_used: totalUsed, updated_at: new Date().toISOString() })
            .eq('user_email', userEmail)
            .eq('date', today);
    }
    else {
        await supabaseAdmin_1.supabaseAdmin.from('token_usage').insert([
            { user_email: userEmail, date: today, tokens_used: tokensUsed },
        ]);
    }
    return { allowed: true, remaining: DAILY_LIMIT - totalUsed };
}
