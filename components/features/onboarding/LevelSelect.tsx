"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PROFICIENCY_LEVELS, type ProficiencyLevel } from "./constants";

export const LevelSelect = ({
  selectedLevel,
  onSelect,
}: {
  selectedLevel: ProficiencyLevel | "";
  onSelect: (level: ProficiencyLevel) => void;
}) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        What&apos;s your current level?
      </h2>
      <p className="text-lg text-muted-foreground mb-8">
        Select the level that best describes your current proficiency
      </p>

      <div className="space-y-4">
        {PROFICIENCY_LEVELS.map((level) => (
          <Card
            key={level.level}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLevel === level.level
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(level.level)}
            role="button"
            tabIndex={0}
            aria-label={`Select level ${level.level}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-sm font-semibold">
                      {level.level}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground">
                      {level.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-1">
                    {level.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {level.details}
                  </p>
                </div>
                {selectedLevel === level.level && (
                  <Check className="w-6 h-6 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
