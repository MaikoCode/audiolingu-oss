import { getToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();
  if (!token) {
    redirect("/sign-in");
  }
  const me = await fetchQuery(api.users.me, {}, { token });
  if (me && me.onboarding_completed === true) {
    redirect("/app");
  }
  return <>{children}</>;
}
