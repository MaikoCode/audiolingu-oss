import * as React from "react";
import { Headphones } from "lucide-react";

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  const siteUrl = process.env.SITE_URL ?? "";
  const ctaHref = siteUrl || "#";
  return (
    <div
      style={{
        fontFamily: "Inter, ui-sans-serif, system-ui, Arial",
        color: "#0f172a",
        padding: "24px",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-pulse-glow">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AudioLingu
            </h1>
          </div>
        </div>
        <h1 style={{ fontSize: 20, lineHeight: 1.4, margin: "0 0 8px" }}>
          Your daily episode is ready
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            margin: "0 0 16px",
            color: "#334155",
          }}
        >
          Hi {firstName || "there"}, your personalized language-learning podcast
          has been generated.
        </p>
        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer"
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Open Audiolingu
        </a>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>
          If the button doesn’t work, copy and paste this link into your
          browser: {ctaHref}
        </p>
      </div>
      <p className="text-sm text-muted-foreground mt-4 text-center">
        You are receiving this because you subscribed to daily episodes. You can
        manage notifications in settings.
      </p>
    </div>
  );
}
