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
import { useMemo, useState } from "react";
import { LANGUAGES } from "@/components/features/onboarding/constants";
import type { Doc } from "@/convex/_generated/dataModel";

type Episode = Doc<"episodes">;

export default function DashboardPage() {
  const greeting = useQuery(api.workflows.myGreeting, {});
  const recent = useQuery(api.episodes.myRecentEpisodes, { limit: 5 });
  const startGeneration = useAction(api.workflows.startMyPodcastGeneration);
  const languageName = useMemo(() => {
    const code = greeting?.target_language;
    if (!code) return "your target language";
    return LANGUAGES.find((l) => l.code === code)?.name || code;
  }, [greeting?.target_language]);

  const [isGenerateDisabled, setIsGenerateDisabled] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (isGenerateDisabled) return;
    setIsGenerateDisabled(true);
    try {
      await startGeneration({});
    } finally {
      setTimeout(() => setIsGenerateDisabled(false), 7000);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {`Welcome back ${greeting?.first_name ?? ""}`} ✨
        </h2>
        <p className="text-muted-foreground">{`Continue learning ${languageName}`}</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card className="border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10">
          <CardHeader>
            <CardTitle className="text-xl">Generate Episode ✨</CardTitle>
            <CardDescription>Wanna generate more episodes?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">
                  🎯 Hit your fluency goal with a new episode.
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                aria-disabled={isGenerateDisabled}
                aria-busy={isGenerateDisabled}
                className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/80 hover:to-accent/80 active:scale-95 transition-all duration-200"
              >
                {isGenerateDisabled ? "Please wait..." : "Generate Episode"}
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

        {recent && recent.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Episode Library</CardTitle>
              <CardDescription>Daily episodes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recent?.slice(1, 5).map((ep: Episode) => (
                <EpisodeCard key={ep._id} episode={ep} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
