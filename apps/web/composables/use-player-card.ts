"use client";

import type { PlayerCardProjection } from "@soccer-stats/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

export function usePlayerCard(userId: string | undefined) {
  const [card, setCard] = useState<PlayerCardProjection | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (!userId) { if (mounted.current) { setCard(null); setLoading(false); } return; }
    if (mounted.current) setLoading(true);
    try { const response = await api.getPlayerCard(userId); if (mounted.current) setCard(response.card); } catch { if (mounted.current) setCard(null); } finally { if (mounted.current) setLoading(false); }
  }, [userId]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { card, loading, refresh };
}
