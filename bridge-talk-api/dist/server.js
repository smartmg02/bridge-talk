"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const third_Person_Message_1 = require("./routes/third-Person-Message");
const third_Person_Reply_1 = require("./routes/third-Person-Reply");
const token_remaining_1 = require("./routes/token-remaining");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
app.post('/api/third-Person-Message', asyncHandler(third_Person_Message_1.thirdPersonMessage));
app.post('/api/third-Person-Reply', asyncHandler(third_Person_Reply_1.thirdPersonReply));
app.get('/api/token-remaining', token_remaining_1.tokenRemaining);
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: '伺服器內部錯誤' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
