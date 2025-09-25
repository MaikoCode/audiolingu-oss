import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export function EmailTemplate({ firstName }: EmailTemplateProps) {
  const siteUrl = process.env.SITE_URL ?? "";
  const logoSrc = `${siteUrl?.replace(/\/$/, "")}/vercel.svg`;
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
          <img
            src={logoSrc}
            alt="Audiolingu"
            width={28}
            height={28}
            style={{ display: "block" }}
          />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Audiolingu</span>
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
            backgroundColor: "#0ea5e9",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 14,
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
          fontSize: 11,
          color: "#94a3b8",
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
