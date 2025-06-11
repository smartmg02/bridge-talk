import { Request, Response, NextFunction } from 'express';
import { checkAndTrackTokenUsage } from '../utils/trackTokenUsage';

export async function tokenRemaining(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const email = req.query.email as string;

  if (!email) {
    res.status(400).json({ error: '⚠️ 請提供 email 查詢 token 剩餘量' });
    return;
  }

  try {
    const { remaining } = await checkAndTrackTokenUsage(email, 0);
    res.status(200).json({ remaining });
  } catch (error) {
    next(error); // 讓 asyncHandler 捕捉這個錯誤，交給全域錯誤處理
  }
}
