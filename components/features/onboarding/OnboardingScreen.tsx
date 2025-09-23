"use client";

import { StepHeader } from "./StepHeader";
import { LanguageSelect } from "./LanguageSelect";
import { LevelSelect } from "./LevelSelect";
import { InterestsSelect } from "./InterestsSelect";
import { OnboardingNavigation } from "./OnboardingNavigation";
import { useOnboardingFlow } from "./useOnboardingFlow";
import { Globe, BookOpen, Headphones, Music } from "lucide-react";
import type { ProficiencyLevel } from "./constants";
import { VoiceCatalog } from "@/components/features/voices/VoiceCatalog";

export const OnboardingScreen = () => {
  const {
    step,
    progress,
    selectedLanguage,
    selectedLevel,
    selectedInterests,
    selectedVoiceId,
    prefetchedVoices,
    submitting,
    sessionPending,
    session,
    setSelectedLanguage,
    setSelectedLevel,
    toggleInterest,
    setSelectedVoiceId,
    handleNext,
    handleBack,
    canProceed,
  } = useOnboardingFlow();

  const totalSteps = 4;
  const handleLevelSelect = (level: ProficiencyLevel) =>
    setSelectedLevel(level);

  return (
    <div className="min-h-screen bg-background">
      <StepHeader step={step} totalSteps={totalSteps} progress={progress} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {step === 1 && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <LanguageSelect
              selectedLanguage={selectedLanguage}
              onSelect={setSelectedLanguage}
            />
          </div>
        )}

        {step === 2 && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-secondary" />
            </div>
            <LevelSelect
              selectedLevel={selectedLevel}
              onSelect={handleLevelSelect}
            />
          </div>
        )}

        {step === 3 && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Headphones className="w-8 h-8 text-accent" />
            </div>
            <InterestsSelect
              selectedInterests={selectedInterests}
              toggleInterest={toggleInterest}
            />
          </div>
        )}

        {step === 4 && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                Choose your preferred voice
              </h2>
              <p className="text-muted-foreground">
                Preview and select the voice you want for your personalized
                episodes.
              </p>
              <VoiceCatalog
                initialFilters={{ language: selectedLanguage || "en" }}
                selectedVoiceId={selectedVoiceId ?? undefined}
                onSelect={setSelectedVoiceId}
                initialVoices={prefetchedVoices ?? undefined}
              />
            </div>
          </div>
        )}

        <OnboardingNavigation
          step={step}
          totalSteps={totalSteps}
          canProceed={canProceed}
          pending={submitting || sessionPending || !session}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>
    </div>
  );
};
