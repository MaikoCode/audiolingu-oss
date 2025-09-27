"use client";

import Image from "next/image";
import React from "react";
import { useNowPlaying } from "./NowPlayingContext";
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
import { useAction, useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Episode = {
  _id: Id<"episodes">;
  title?: string;
  language: string;
  proficiency_level: "A1" | "A2" | "B1" | "B2" | "C1";
  cover_image_id?: string;
  summary?: string;
  transcript?: string;
  aligned_transcript?: string;
  sentence_alignments?: { text: string; start: number; end: number }[];
  word_alignments?: { word: string; start: number; end: number }[];
  audioStorageId?: string;
  durationSeconds?: number;
  status: "draft" | "queued" | "generating" | "ready" | "failed";
  _creationTime: number;
  feedback?: "good" | "bad";
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
  const setFeedback = useMutation(api.episodes.setFeedback);
  const generateQuiz = useAction(api.quizzes.generateQuizForEpisode);
  const existingQuiz = useQuery(api.quizzes.getQuizPublicIdForEpisode, {
    episodeId: episode._id,
  });
  const { setCurrent, openTranscript } = useNowPlaying();
  // bottom bar handles playback; we only provide entry points here

  // Local loading state to prevent multiple quiz generations
  const [isGeneratingQuiz, setIsGeneratingQuiz] =
    React.useState<boolean>(false);
  const [generatedPublicId, setGeneratedPublicId] = React.useState<
    string | undefined
  >(undefined);

  const handleSetFeedback = async (value: "good" | "bad" | undefined) => {
    try {
      await setFeedback({ episodeId: episode._id, feedback: value });
    } catch {
      // no-op
    }
  };

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="w-28 h-28 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted self-center sm:self-auto">
            {cover?.url ? (
              <Image
                src={cover.url}
                alt="Episode cover"
                width={112}
                height={112}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                🎧
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-3">
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
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary"
                    disabled={!audio?.url}
                    aria-label="Play"
                    onClick={() => {
                      setCurrent({
                        id: String(episode._id),
                        title: episode.title ?? "Episode",
                        coverUrl: cover?.url,
                        audioUrl: audio?.url ?? "",
                        sentences: episode.sentence_alignments,
                        words: episode.word_alignments ?? [],
                      });
                      // trigger autoplay by dispatching a custom event the bar listens for
                      window.dispatchEvent(
                        new CustomEvent("nowplaying:autoplay")
                      );
                    }}
                  >
                    ▶️ Play
                  </Button>
                  {episode.sentence_alignments?.length ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!audio?.url}
                      aria-label="Open transcript"
                      onClick={() => {
                        setCurrent({
                          id: String(episode._id),
                          title: episode.title ?? "Episode",
                          coverUrl: cover?.url,
                          audioUrl: audio?.url ?? "",
                          sentences: episode.sentence_alignments,
                          words: episode.word_alignments ?? [],
                        });
                        openTranscript();
                      }}
                    >
                      Transcript
                    </Button>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {existingQuiz?.publicId || generatedPublicId ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-label="Open quiz"
                      onClick={() => {
                        const publicId =
                          existingQuiz?.publicId || generatedPublicId;
                        if (!publicId) return;
                        window.open(
                          `/quiz/${publicId}`,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                    >
                      Open Quiz
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Generate quiz"
                      disabled={isGeneratingQuiz}
                      aria-disabled={isGeneratingQuiz}
                      aria-busy={isGeneratingQuiz}
                      onClick={async () => {
                        if (isGeneratingQuiz) return;
                        setIsGeneratingQuiz(true);
                        try {
                          const res = await generateQuiz({
                            episodeId: episode._id,
                          });
                          setGeneratedPublicId(res.publicId);
                        } catch {
                          // silently ignore
                        } finally {
                          // In case navigation doesn't occur (error), re-enable
                          setIsGeneratingQuiz(false);
                        }
                      }}
                    >
                      {isGeneratingQuiz ? (
                        <span className="inline-flex items-center">
                          <span
                            className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                            aria-hidden="true"
                          />
                          Generating...
                        </span>
                      ) : (
                        "Generate Quiz"
                      )}
                    </Button>
                  )}
                </div>
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={
                            episode.feedback === "good" ? "default" : "ghost"
                          }
                          aria-label="Like this episode"
                          onClick={() =>
                            handleSetFeedback(
                              episode.feedback === "good" ? undefined : "good"
                            )
                          }
                        >
                          ❤️
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Like</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant={
                            episode.feedback === "bad" ? "destructive" : "ghost"
                          }
                          aria-label="Downvote this episode"
                          onClick={() =>
                            handleSetFeedback(
                              episode.feedback === "bad" ? undefined : "bad"
                            )
                          }
                        >
                          ⬇️
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Downvote</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
