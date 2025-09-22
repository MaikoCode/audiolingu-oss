"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRef, useState } from "react";
import { Circle, Pause, Play } from "lucide-react";
import Image from "next/image";

export type VoiceItem = {
  voiceId: string;
  name: string;
  gender?: "male" | "female" | "neutral";
  age?: "young" | "middle_aged" | "old";
  category?: "professional" | "famous" | "high_quality";
  language?: string;
  previewUrl?: string;
  imageUrl?: string;
  descriptive?: string;
};

export const VoiceCard = ({
  voice,
  selected,
  onSelect,
}: {
  voice: VoiceItem;
  selected: boolean;
  onSelect: (voiceId: string) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await el.play();
      setIsPlaying(true);
    } catch {
      // ignore
    }
  };

  const handleSelect = () => onSelect(voice.voiceId);
  const handlePreviewClick: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.stopPropagation();
    handleTogglePlay();
  };
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(voice.voiceId);
    }
  };

  return (
    <Card
      className={`transition-all py-0 hover:shadow-sm ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Voice ${voice.name}`}
      aria-pressed={selected}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex items-center justify-center text-xl">
            {voice.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={voice.imageUrl}
                alt={`${voice.name} avatar`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>🎙️</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="min-w-0">
              <div className="font-medium leading-tight truncate">
                {voice.name}
              </div>
              {voice.descriptive ? (
                <div className="text-xs text-muted-foreground truncate">
                  {voice.descriptive}
                </div>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
              {voice.gender ? (
                <Badge variant="outline" className="px-1.5 py-0 h-5">
                  {voice.gender}
                </Badge>
              ) : null}
              {voice.age ? (
                <Badge variant="outline" className="px-1.5 py-0 h-5">
                  {voice.age}
                </Badge>
              ) : null}
              {voice.category ? (
                <Badge variant="outline" className="px-1.5 py-0 h-5">
                  {voice.category}
                </Badge>
              ) : null}
              {voice.language ? (
                <Badge variant="outline" className="px-1.5 py-0 h-5">
                  {voice.language}
                </Badge>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePreviewClick}
            disabled={!voice.previewUrl}
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Circle
              className={`absolute w-10 h-10 ${isPlaying ? "text-primary" : "text-muted-foreground"}`}
            />
            {isPlaying ? (
              <Pause className="w-4 h-4 text-primary" />
            ) : (
              <Play className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <audio
          ref={audioRef}
          src={voice.previewUrl}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};
