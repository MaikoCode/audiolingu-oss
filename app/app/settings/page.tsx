"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LanguageSelect } from "@/components/features/onboarding/LanguageSelect";
import { LevelSelect } from "@/components/features/onboarding/LevelSelect";
import { VoiceCatalog } from "@/components/features/voices/VoiceCatalog";
import { LANGUAGES } from "@/components/features/onboarding/constants";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const SettingsPage = () => {
  const settings = useQuery(api.users.getMySettings, {});
  const updateSettings = useMutation(api.users.updateLearningSettings);
  const setVoice = useMutation(api.users.setPreferredVoice);
  const setDaily = useMutation(api.users.setDailyPodcastEnabled);
  const setEmail = useMutation(api.users.setEmailNotificationsEnabled);

  const [localLanguage, setLocalLanguage] = useState<string>("");
  type Level = "A1" | "A2" | "B1" | "B2" | "C1";
  const [localLevel, setLocalLevel] = useState<Level | "">("");
  const [localDuration, setLocalDuration] = useState<number | null>(null);
  const [localVoice, setLocalVoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dailySaving, setDailySaving] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const initialLanguage = useMemo(() => {
    if (!settings?.target_language) return LANGUAGES[0]?.code ?? "en";
    return settings.target_language;
  }, [settings?.target_language]);

  const currentDuration = useMemo(() => {
    if (typeof localDuration === "number") return localDuration;
    if (typeof settings?.episode_duration === "number")
      return settings.episode_duration;
    return 5;
  }, [localDuration, settings?.episode_duration]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const nextLang =
        localLanguage || settings?.target_language || initialLanguage;
      const nextLevel: Level = (localLevel ||
        settings?.proficiency_level ||
        "A1") as Level;
      const nextDuration = currentDuration;
      await updateSettings({
        target_language: nextLang,
        proficiency_level: nextLevel,
        episode_duration: nextDuration,
      });
      if (localVoice) {
        await setVoice({ voiceId: localVoice });
      }
      toast.success("Preferences saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const getNextUtcSchedule = (hourUTC: number, minuteUTC: number) => {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(hourUTC, minuteUTC, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    return next;
  };

  const nextDailyUtc = useMemo(() => getNextUtcSchedule(12, 0), []);

  const handleToggleDaily = async (enabled: boolean) => {
    try {
      setDailySaving(true);
      await setDaily({ enabled });
      if (!enabled && settings?.send_email) {
        // Keep value server-side as-is; UI email switch is disabled when daily is off
      }
      toast.success(
        enabled ? "Daily generation enabled" : "Daily generation disabled"
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update daily generation");
    } finally {
      setDailySaving(false);
    }
  };

  const handleToggleEmail = async (enabled: boolean) => {
    try {
      if (settings?.daily_podcast_enabled !== true) {
        toast.error("Enable daily generation first");
        return;
      }
      setEmailSaving(true);
      await setEmail({ enabled });
      toast.success(
        enabled ? "Email notifications enabled" : "Email notifications disabled"
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update email notifications");
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your learning preferences and voice
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily episodes</CardTitle>
          <CardDescription>
            Enable daily generation and email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium">Daily generation</span>
              <p className="text-xs text-muted-foreground">
                Generate a new personalized episode every day.
              </p>
            </div>
            <Switch
              aria-label="Toggle daily generation"
              checked={settings?.daily_podcast_enabled === true}
              onCheckedChange={(v) => handleToggleDaily(Boolean(v))}
              disabled={dailySaving || !settings}
              data-state={
                settings?.daily_podcast_enabled === true
                  ? "checked"
                  : "unchecked"
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-medium">Email notification</span>
              <p className="text-xs text-muted-foreground">
                Receive an email when your daily episode is ready.
              </p>
            </div>
            <Switch
              aria-label="Toggle email notifications"
              checked={
                settings?.send_email !== false &&
                settings?.daily_podcast_enabled === true
              }
              onCheckedChange={(v) => handleToggleEmail(Boolean(v))}
              disabled={
                emailSaving ||
                settings?.daily_podcast_enabled !== true ||
                !settings
              }
              data-state={
                settings?.send_email !== false &&
                settings?.daily_podcast_enabled === true
                  ? "checked"
                  : "unchecked"
              }
            />
          </div>

          {settings?.daily_podcast_enabled === true && (
            <div className="space-y-2" aria-live="polite">
              <label className="text-sm font-medium" htmlFor="daily-time">
                Next generation time
              </label>
              <Input
                id="daily-time"
                readOnly
                value={`${nextDailyUtc.toLocaleString()} (local) — ${nextDailyUtc.toUTCString()} (UTC)`}
                aria-readonly="true"
                className="cursor-default"
              />
              <p className="text-xs text-muted-foreground">
                Schedule: 12:00 UTC daily
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning preferences</CardTitle>
          <CardDescription>Target language, level and duration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <LanguageSelect
              selectedLanguage={
                localLanguage || settings?.target_language || initialLanguage
              }
              onSelect={(code) => setLocalLanguage(code)}
            />
          </div>

          <div>
            <LevelSelect
              selectedLevel={
                (localLevel || (settings?.proficiency_level as Level) || "") as
                  | Level
                  | ""
              }
              onSelect={(lvl) => setLocalLevel(lvl as Level)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Episode duration (minutes)
            </label>
            <div className="flex items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalDuration(5)}
                aria-label="Set duration 5 minutes"
                aria-pressed={currentDuration === 5}
                className={currentDuration === 5 ? "bg-primary/10" : ""}
              >
                5
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalDuration(10)}
                aria-label="Set duration 10 minutes"
                aria-pressed={currentDuration === 10}
                className={currentDuration === 10 ? "bg-primary/10" : ""}
              >
                10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocalDuration(15)}
                aria-label="Set duration 15 minutes"
                aria-pressed={currentDuration === 15}
                className={currentDuration === 15 ? "bg-primary/10" : ""}
              >
                15
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSave}
              aria-label="Save preferences"
              disabled={saving}
              aria-busy={saving}
            >
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Choose narration voice</CardTitle>
          <CardDescription>
            Browse voices catalog and pick your preferred voice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VoiceCatalog
            initialFilters={{
              language: settings?.target_language || initialLanguage,
            }}
            selectedVoiceId={localVoice ?? settings?.preferred_voice ?? null}
            onSelect={(voiceId) => setLocalVoice(voiceId)}
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={handleSave}
              aria-label="Save voice"
              disabled={saving}
              aria-busy={saving}
            >
              Save voice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
