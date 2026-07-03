"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { PublicUser } from "@soccer-stats/shared";
import { api, type DashboardResponse } from "../../lib/api";
import type { ToastMessage, ToastTone } from "../feedback/toast";

export type SessionState = "loading" | "authenticated" | "anonymous";

interface SessionContextValue {
  status: SessionState;
  user: PublicUser | null;
  dashboard: DashboardResponse | null;
  feedback: ToastMessage | null;
  setFeedback: (message: string, tone?: ToastTone) => void;
  clearFeedback: () => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SessionState>("loading");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [feedback, setFeedbackState] = useState<ToastMessage | null>(null);

  const setFeedback = useCallback((message: string, tone: ToastTone = "success") => {
    setFeedbackState({ id: Date.now(), message, tone });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedbackState(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [me, data] = await Promise.all([api.me(), api.dashboard()]);
      setUser(me.user);
      setDashboard(data);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setDashboard(null);
      setStatus("anonymous");
    }
  }, []);

  const logout = useCallback(async () => {
    await api.signOut();
    setUser(null);
    setDashboard(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ status, user, dashboard, feedback, setFeedback, clearFeedback, refresh, logout }),
    [clearFeedback, dashboard, feedback, logout, refresh, setFeedback, status, user]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession deve ser usado dentro de SessionProvider.");
  }

  return context;
}
