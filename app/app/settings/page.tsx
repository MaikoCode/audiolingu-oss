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

  const [localLanguage, setLocalLanguage] = useState<string>("");
  type Level = "A1" | "A2" | "B1" | "B2" | "C1";
  const [localLevel, setLocalLevel] = useState<Level | "">("");
  const [localDuration, setLocalDuration] = useState<number | null>(null);
  const [localVoice, setLocalVoice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
