import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/features/layout/AppSidebar";
import { NowPlayingProvider } from "@/components/features/episodes/NowPlayingContext";
import NowPlayingBar from "@/components/features/episodes/NowPlayingBar";
import { getToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();
  if (!token) {
    redirect("/sign-in");
  }
  const me = await fetchQuery(api.users.me, {}, { token });
  if (!me || me.onboarding_completed !== true) {
    redirect("/onboarding");
  }
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
