import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { proxyToOpenAI } from "./utils/openaiProxy.js";

// 載入 .env 檔案
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// 中介軟體
app.use(cors());
app.use(express.json());

// 路由：轉送前端請求給 OpenAI API
app.post("/proxy/openai", async (req, res) => {
  try {
    const response = await proxyToOpenAI(req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Proxy Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Internal server error",
    });
  }
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`🚀 BridgeTalk Proxy Server is running at http://localhost:${port}`);
});
// 測試用首頁路由
app.get('/', (req, res) => {
  res.send(`
    <h2>✅ BridgeTalk Proxy Server is Running</h2>
    <p>Try sending a POST request to <code>/proxy/openai</code> with a JSON body.</p>
  `)
})
