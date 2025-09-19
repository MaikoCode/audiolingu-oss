"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { INTERESTS } from "./constants";

export const InterestsSelect = ({
  selectedInterests,
  toggleInterest,
}: {
  selectedInterests: string[];
  toggleInterest: (id: string) => void;
}) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        What interests you?
      </h2>
      <p className="text-lg text-muted-foreground mb-2">
        Choose at least 3 topics you&apos;d like to hear about in your podcasts
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Selected: {selectedInterests.length} / {INTERESTS.length}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {INTERESTS.map((interest) => (
          <Card
            key={interest.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedInterests.includes(interest.id)
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleInterest(interest.id)}
            role="button"
            tabIndex={0}
            aria-label={`Toggle interest ${interest.name}`}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">{interest.icon}</div>
              <h3 className="text-sm font-medium text-foreground">
                {interest.name}
              </h3>
              {selectedInterests.includes(interest.id) && (
                <Check className="w-4 h-4 text-primary mx-auto mt-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
