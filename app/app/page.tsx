"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EpisodeCard } from "@/components/features/episodes/EpisodeCard";
import { useMemo } from "react";
import { LANGUAGES } from "@/components/features/onboarding/constants";

type Episode = {
  _id: string;
  title?: string;
  language: string;
  proficiency_level: "A1" | "A2" | "B1" | "B2" | "C1";
  cover_image_id?: string;
  summary?: string;
  transcript?: string;
  audioStorageId?: string;
  durationSeconds?: number;
  status: "draft" | "queued" | "generating" | "ready" | "failed";
  _creationTime: number;
};

export default function DashboardPage() {
  const greeting = useQuery(api.workflows.myGreeting, {});
  const recent = useQuery(api.episodes.myRecentEpisodes, { limit: 5 });
  const startGeneration = useAction(api.workflows.startMyPodcastGeneration);
  const languageName = useMemo(() => {
    const code = greeting?.target_language;
    if (!code) return "your target language";
    return LANGUAGES.find((l) => l.code === code)?.name || code;
  }, [greeting?.target_language]);

  const handleGenerate = async () => {
    await startGeneration({});
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {`Welcome back ${greeting?.first_name ?? ""}`} ✨
        </h2>
        <p className="text-muted-foreground">{`Continue learning ${languageName}`}</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="text-xl">
              Want Something Specific? ✨
            </CardTitle>
            <CardDescription>
              Generate a custom episode on any topic you choose
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  Create personalized episodes beyond your daily content. Choose
                  your own topics and get instant AI-generated lessons.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>✨ Custom topics</span>
                  <span>•</span>
                  <span>🎯 Your level</span>
                  <span>•</span>
                  <span>⚡ Instant generation</span>
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                className="bg-gradient-to-r from-secondary to-accent"
              >
                ✨ Generate Episode
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Today&apos;s Daily Episode
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                    Auto-Generated
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your personalized daily learning content
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recent && recent.length > 0 ? (
              <EpisodeCard episode={recent[0] as Episode} />
            ) : (
              <div className="text-sm text-muted-foreground">
                No episodes yet. Click Generate to create your first one.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Episode Library</CardTitle>
            <CardDescription>
              Daily episodes and your custom generations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recent?.slice(1).map((ep: Episode) => (
              <EpisodeCard key={ep._id} episode={ep} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
