"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { VoiceItem } from "@/components/features/voices/VoiceCard";
import type { ProficiencyLevel } from "./constants";

export type OnboardingStep = 1 | 2 | 3 | 4;

export const useOnboardingFlow = () => {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyLevel | "">("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [prefetchedVoices, setPrefetchedVoices] = useState<VoiceItem[] | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const { data: session, isPending } = useSession();
  const me = useQuery(api.users.me, {});
  const ensure = useMutation(api.users.ensure);
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  const setPreferredVoice = useMutation(api.users.setPreferredVoice);
  const startGeneration = useAction(api.workflows.startMyPodcastGeneration);
  const searchVoices = useAction(api.elevenlabs.searchVoices);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const run = async () => {
      if (!session) return;
      try {
        if (!me) await ensure({});
      } catch {
        // ignore
      }
    };
    run();
  }, [session, me, ensure]);

  // Prefetch voices as soon as language is chosen
  useEffect(() => {
    if (!selectedLanguage) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await searchVoices({ language: selectedLanguage });
        if (!cancelled) setPrefetchedVoices((res.voices as VoiceItem[]) ?? []);
      } catch {
        // ignore prefetch errors
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedLanguage, searchVoices]);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  const canProceed = useMemo(() => {
    if (step === 1) return selectedLanguage !== "";
    if (step === 2) return selectedLevel !== "";
    if (step === 3) return selectedInterests.length >= 3;
    if (step === 4) return Boolean(selectedVoiceId);
    return false;
  }, [
    step,
    selectedLanguage,
    selectedLevel,
    selectedInterests,
    selectedVoiceId,
  ]);

  const handleNext = async () => {
    if (step < 4) {
      setStep((s) => (s + 1) as OnboardingStep);
      return;
    }
    if (!session) return router.replace("/sign-in");
    if (
      !selectedLanguage ||
      !selectedLevel ||
      selectedInterests.length < 3 ||
      !selectedVoiceId
    )
      return;

    try {
      setSubmitting(true);
      await completeOnboarding({
        target_language: selectedLanguage,
        proficiency_level: selectedLevel as ProficiencyLevel,
        interests: selectedInterests,
      });
      await setPreferredVoice({ voiceId: selectedVoiceId });
      await startGeneration({});
      router.replace("/app");
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep((s) => (s > 1 ? ((s - 1) as OnboardingStep) : s));
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  return {
    // state
    step,
    progress,
    selectedLanguage,
    selectedLevel,
    selectedInterests,
    selectedVoiceId,
    prefetchedVoices,
    submitting,
    sessionPending: isPending,
    session,
    // actions
    setSelectedLanguage,
    setSelectedLevel,
    toggleInterest,
    setSelectedVoiceId,
    handleNext,
    handleBack,
    canProceed,
  };
};
