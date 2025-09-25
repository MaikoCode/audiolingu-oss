"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/features/layout/AppSidebar";
import { NowPlayingProvider } from "@/components/features/episodes/NowPlayingContext";
import NowPlayingBar from "@/components/features/episodes/NowPlayingBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NowPlayingProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-12 items-center gap-2 border-b px-3">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <div className="flex-1" />
          </div>
          <div className="flex-1 overflow-auto pb-24">{children}</div>
        </SidebarInset>
        <NowPlayingBar />
      </NowPlayingProvider>
    </SidebarProvider>
  );
}
