"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const OnboardingNavigation = ({
  step,
  totalSteps,
  canProceed,
  pending,
  onBack,
  onNext,
}: {
  step: number;
  totalSteps: number;
  canProceed: boolean;
  pending?: boolean;
  onBack: () => void;
  onNext: () => void | Promise<void>;
}) => {
  return (
    <div className="flex items-center justify-between pt-8">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={step === 1}
        className="flex items-center gap-2 bg-transparent"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Button
        onClick={onNext}
        disabled={!canProceed || !!pending}
        className="flex items-center gap-2"
      >
        {step === totalSteps
          ? pending
            ? "Saving..."
            : "Complete Setup"
          : "Continue"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
