"use client";

import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Headphones } from "lucide-react";

export const StepHeader = ({
  step,
  totalSteps,
  progress,
}: {
  step: number;
  totalSteps: number;
  progress: number;
}) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Go home">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Headphones className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">AudioLingu</h1>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <div className="w-32">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>
    </header>
  );
};
