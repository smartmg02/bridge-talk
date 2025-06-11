import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { thirdPersonMessage } from './routes/third-Person-Message';
import { thirdPersonReply } from './routes/third-Person-Reply';
import { tokenRemaining } from './routes/token-remaining';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

app.post('/api/third-Person-Message', asyncHandler(thirdPersonMessage));
app.post('/api/third-Person-Reply', asyncHandler(thirdPersonReply));
app.get('/api/token-remaining', tokenRemaining);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
