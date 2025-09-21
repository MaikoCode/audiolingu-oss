"use client";

import Image from "next/image";
import React from "react";
import AudioPlayer from "./AudioPlayer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

export const EpisodeCard = ({ episode }: { episode: Episode }) => {
  const isGenerating = episode.status !== "ready";
  const cover = useQuery(
    api.r2.getUrlForKey,
    episode.cover_image_id ? { key: episode.cover_image_id } : "skip"
  );
  const audio = useQuery(
    api.r2.getUrlForKey,
    episode.audioStorageId ? { key: episode.audioStorageId } : "skip"
  );

  // reserved for future inline controls

  // Legacy play handler removed in favor of AudioPlayer

  return (
    <Card
      className={cn(isGenerating && "border-yellow-300/50 bg-yellow-50/30")}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {episode.title ?? "Personalized Episode"}
            </CardTitle>
            <CardDescription>
              {isGenerating ? "Generating…" : (episode.summary ?? "Ready")}
            </CardDescription>
          </div>
          {isGenerating ? (
            <Badge className="bg-yellow-500 text-white">Generating</Badge>
          ) : (
            <Badge className="bg-green-600 text-white">Ready</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            {cover?.url ? (
              <Image
                src={cover.url}
                alt="Episode cover"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                🎧
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {episode.proficiency_level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {episode.language}
              </span>
              {!isGenerating && episode.durationSeconds ? (
                <span className="text-xs text-muted-foreground">
                  {Math.round(episode.durationSeconds / 60)} min
                </span>
              ) : null}
            </div>
            {isGenerating ? (
              <div className="space-y-2">
                <Progress value={33} className="h-1" />
                <p className="text-xs text-muted-foreground">
                  We are preparing your episode…
                </p>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <AudioPlayer
                  src={audio?.url}
                  title={episode.title ?? "Episode"}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    ❤️
                  </Button>
                  <Button size="sm" variant="ghost">
                    ⬇️
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
