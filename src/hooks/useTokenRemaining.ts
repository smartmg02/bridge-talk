import { useCallback, useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function useTokenRemaining() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRemaining = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/token-remaining`);
      if (!res.ok) throw new Error('Token 查詢失敗');
      const data = await res.json();
      setRemaining(data.remaining);
      setLimit(data.limit);
    } catch {
      setRemaining(null);
      setLimit(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemaining();
  }, [fetchRemaining]);

  return { remaining, limit, loading, refetch: fetchRemaining };
}
