"use client";

import { useCallback, useEffect, useState } from "react";
import type { Team, TeamJoinRequest, TeamMessage } from "@soccer-stats/shared";
import { api } from "../lib/api";

export function useTeamDetail(team: Team, canManage: boolean) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [chat, pending] = await Promise.all([api.listTeamMessages(team.id), canManage ? api.listTeamJoinRequests(team.id) : Promise.resolve({ requests: [] })]);
      setMessages(chat.messages); setRequests(pending.requests.filter((item) => item.status === "pending"));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível carregar a atividade do time."); }
    finally { setLoading(false); }
  }, [canManage, team.id]);
  useEffect(() => { void reload(); }, [reload]);
  const sendMessage = useCallback(async (text: string) => { const { message } = await api.sendTeamMessage(team.id, text); setMessages((current) => [message, ...current]); }, [team.id]);
  const deleteMessage = useCallback(async (messageId: string) => { await api.deleteTeamMessage(team.id, messageId); setMessages((current) => current.filter((message) => message.id !== messageId)); }, [team.id]);
  const reviewRequest = useCallback(async (requestId: string, decision: "approve" | "reject") => { await api.reviewTeamJoinRequest(team.id, requestId, decision); setRequests((current) => current.filter((item) => item.id !== requestId)); }, [team.id]);
  return { messages, requests, loading, error, reload, sendMessage, deleteMessage, reviewRequest };
}
