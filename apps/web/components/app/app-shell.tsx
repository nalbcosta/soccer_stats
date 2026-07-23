"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "../feedback/loading-state";
import { ToastViewport } from "../feedback/toast";
import { AppHeader } from "./app-header";
import { ContextRail } from "./context-rail";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileTabBar } from "./mobile-tab-bar";
import { SessionProvider, useSession } from "./session-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppFrame>{children}</AppFrame>
    </SessionProvider>
  );
}

function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { clearFeedback, feedback, status } = useSession();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "anonymous") {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas pb-20 text-text md:pb-0">
      <AppHeader />
      <div className="mx-auto grid max-w-7xl gap-5 px-3 py-4 sm:px-4 md:px-6 md:py-8 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_280px]">
        <DesktopSidebar />
        <main className="min-w-0">{children}</main>
        <ContextRail />
      </div>
      <MobileTabBar />
      <ToastViewport toast={feedback} onDismiss={clearFeedback} />
    </div>
  );
}
