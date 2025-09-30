"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";

const features: ReadonlyArray<{ id: string; title: string }> = [
  {
    id: "playback",
    title:
      "Interactive episode playback with word-level transcript synchronization",
  },
  {
    id: "quiz",
    title:
      "AI-powered quiz generation with progress scoring and comprehension tracking",
  },
  {
    id: "custom-episodes",
    title:
      "Custom podcast episodes generated based on your level, language, and interests",
  },
] as const;

export default function CoreFeatures() {
  return (
    <section aria-labelledby="core-features-heading" className="py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <h3
          id="core-features-heading"
          className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-8 text-center"
        >
          <span role="img" aria-label="Headphones" className="mr-2">
            🎧
          </span>
          Core Learning Experience
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature) => (
            <Card key={feature.id} className="h-full">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-semibold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
