"use client";

import { useCallback, useEffect, useState } from "react";
import type { MatchComment } from "@soccer-stats/shared";
import { api } from "../lib/api";

export function useMatchComments(matchId: string) {
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => { try { setComments((await api.listMatchComments(matchId)).comments); } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar os comentários."); } }, [matchId]);
  useEffect(() => { void reload(); }, [reload]);
  const send = useCallback(async (text: string) => { const { comment } = await api.sendMatchComment(matchId, text); setComments((current) => [comment, ...current]); }, [matchId]);
  const remove = useCallback(async (commentId: string) => { await api.deleteMatchComment(matchId, commentId); setComments((current) => current.filter((comment) => comment.id !== commentId)); }, [matchId]);
  return { comments, error, send, remove };
}
