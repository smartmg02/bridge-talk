"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRemaining = tokenRemaining;
const trackTokenUsage_1 = require("../utils/trackTokenUsage");
async function tokenRemaining(req, res, next) {
    const email = req.query.email;
    if (!email) {
        res.status(400).json({ error: '⚠️ 請提供 email 查詢 token 剩餘量' });
        return;
    }
    try {
        const { remaining } = await (0, trackTokenUsage_1.checkAndTrackTokenUsage)(email, 0);
        res.status(200).json({ remaining });
    }
    catch (error) {
        next(error); // 讓 asyncHandler 捕捉這個錯誤，交給全域錯誤處理
    }
}
