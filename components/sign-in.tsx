"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Basic email pattern check
  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email.trim()), [email]);

  // Client-side rate limit using localStorage with sliding window
  const MAGIC_LINK_STORAGE_KEY = "magic_link_attempts";
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_ATTEMPTS = 3; // per window per browser
  const COOLDOWN_AFTER_SEND_SECONDS = 45; // short cool down per browser

  const getAttempts = useCallback((): number[] => {
    try {
      const raw = localStorage.getItem(MAGIC_LINK_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as number[];
      if (!Array.isArray(parsed)) return [];
      const now = Date.now();
      const filtered = parsed.filter((t) => now - t < WINDOW_MS);
      if (filtered.length !== parsed.length) {
        localStorage.setItem(MAGIC_LINK_STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    } catch {
      return [];
    }
  }, [WINDOW_MS]);

  const recordAttempt = useCallback(() => {
    try {
      const attempts = getAttempts();
      attempts.push(Date.now());
      localStorage.setItem(MAGIC_LINK_STORAGE_KEY, JSON.stringify(attempts));
    } catch {
      // ignore write errors
    }
  }, [getAttempts]);

  const startCooldown = useCallback((seconds: number) => {
    setCooldownSeconds(seconds);
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) {
          if (cooldownIntervalRef.current)
            clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current)
        clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  const handleSendMagicLink = useCallback(async () => {
    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (cooldownSeconds > 0) {
      toast.message("Please wait before requesting another link.");
      return;
    }
    const attempts = getAttempts();
    if (attempts.length >= MAX_ATTEMPTS) {
      toast.error("Too many requests. Try again later.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn.magicLink({
        email: email.trim(),
        callbackURL: "/app",
        newUserCallbackURL: "/onboarding",
        errorCallbackURL: "/sign-in?error=magic_link",
      });
      if (error) {
        toast.error(error.message ?? "Failed to send magic link");
        return;
      }
      recordAttempt();
      startCooldown(COOLDOWN_AFTER_SEND_SECONDS);
      toast.success("Check your email for the sign-in link.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    isEmailValid,
    cooldownSeconds,
    getAttempts,
    recordAttempt,
    startCooldown,
    email,
  ]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        {/* <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Magic link form */}
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              aria-invalid={!email || isEmailValid ? "false" : "true"}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSendMagicLink();
                }
              }}
            />
            <Button
              className="w-full"
              disabled={loading || !isEmailValid || cooldownSeconds > 0}
              onClick={() => void handleSendMagicLink()}
              aria-disabled={loading || !isEmailValid || cooldownSeconds > 0}
              aria-label="Send magic sign-in link"
            >
              {cooldownSeconds > 0
                ? `Send link (wait ${cooldownSeconds}s)`
                : "Send magic link"}
            </Button>
            <p className="text-xs text-muted-foreground">
              We’ll email you a secure sign-in link. No password required.
            </p>
          </div>

          <div
            className={cn(
              "w-full gap-2 flex items-center",
              "justify-between flex-col"
            )}
          >
            <Button
              variant="outline"
              className={cn("w-full gap-2")}
              disabled={loading}
              onClick={async () => {
                await signIn.social(
                  {
                    provider: "google",
                    callbackURL: "/onboarding",
                  },
                  {
                    onRequest: () => setLoading(true),
                    onResponse: () => setLoading(false),
                  }
                );
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285F4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34A853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#EB4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-center w-full border-t py-4">
          <p className="text-center text-xs text-neutral-500">
            built with{" "}
            <Link
              href="https://better-auth.com"
              className="underline"
              target="_blank"
            >
              <span className="dark:text-white/70 cursor-pointer">
                better-auth.
              </span>
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
