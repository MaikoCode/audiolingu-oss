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
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Headphones size={20} color="#ffffff" />
            </div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                margin: "0 0 0 8px",
                color: "#0f172a",
              }}
            >
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
          style={{
            display: "inline-block",
            backgroundColor: "#6366f1",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Open Audiolingu
        </a>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 16 }}>
          If the button doesn’t work, copy and paste this link into your
          browser: {ctaHref}
        </p>
      </div>
      <p
        style={{
          fontSize: 12,
          color: "#64748b",
          marginTop: 16,
          textAlign: "center",
        }}
      >
        You are receiving this because you subscribed to daily episodes. You can
        manage notifications in settings.
      </p>
    </div>
  );
}
