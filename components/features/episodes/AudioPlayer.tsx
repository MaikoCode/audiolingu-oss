"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type AudioPlayerProps = {
  src?: string;
  autoPlay?: boolean;
  className?: string;
  title?: string;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export const AudioPlayer = ({
  src,
  autoPlay,
  className,
  title,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [rate, setRate] = useState(1);

  const effectiveCurrent = seeking ? seekValue : currentTime;
  const canPlay = Boolean(src);

  const cancelRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const step = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    setCurrentTime(el.currentTime);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const handleLoaded = () => setDuration(el.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      cancelRaf();
    };
    const handlePause = () => {
      setIsPlaying(false);
      cancelRaf();
    };
    const handlePlay = () => {
      setIsPlaying(true);
      cancelRaf();
      rafRef.current = requestAnimationFrame(step);
    };
    const handleTimeUpdate = () => setCurrentTime(el.currentTime);
    const handleProgress = () => {
      try {
        if (!el.buffered || el.buffered.length === 0) return setBufferedTime(0);
        const lastIndex = el.buffered.length - 1;
        const end = el.buffered.end(lastIndex);
        setBufferedTime(Math.min(end, el.duration || end));
      } catch {
        setBufferedTime(0);
      }
    };

    el.addEventListener("loadedmetadata", handleLoaded);
    el.addEventListener("ended", handleEnded);
    el.addEventListener("pause", handlePause);
    el.addEventListener("play", handlePlay);
    el.addEventListener("timeupdate", handleTimeUpdate);
    el.addEventListener("progress", handleProgress);
    el.addEventListener("loadeddata", handleProgress);
    el.addEventListener("loadedmetadata", handleProgress);
    return () => {
      el.removeEventListener("loadedmetadata", handleLoaded);
      el.removeEventListener("ended", handleEnded);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("timeupdate", handleTimeUpdate);
      el.removeEventListener("progress", handleProgress);
      el.removeEventListener("loadeddata", handleProgress);
      el.removeEventListener("loadedmetadata", handleProgress);
      cancelRaf();
    };
  }, [step]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = rate;
  }, [rate]);

  useEffect(() => {
    if (!autoPlay) return;
    const el = audioRef.current;
    if (!el || !src) return;
    el.play().catch(() => {});
  }, [autoPlay, src]);

  const handleTogglePlay = () => {
    const el = audioRef.current;
    if (!el || !src) return;
    if (isPlaying) {
      el.pause();
      return;
    }
    el.play();
  };

  const handleSeekStart = (value: number) => {
    setSeeking(true);
    setSeekValue(value);
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSeekCommit = (value: number) => {
    const el = audioRef.current;
    if (!el) {
      setSeeking(false);
      return;
    }
    el.currentTime = value;
    setCurrentTime(value);
    setSeeking(false);
    if (isPlaying) {
      cancelRaf();
      rafRef.current = requestAnimationFrame(step);
    }
  };

  const handleSkip = (delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    const next = Math.max(
      0,
      Math.min((duration || 0) - 0.25, el.currentTime + delta)
    );
    el.currentTime = next;
    setCurrentTime(next);
  };

  const bufferedPercent = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (bufferedTime / duration) * 100));
  }, [bufferedTime, duration]);

  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-card text-card-foreground p-3",
        className
      )}
      role="region"
      aria-label={title ? `Player for ${title}` : "Audio player"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " ") {
          e.preventDefault();
          handleTogglePlay();
        }
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-secondary"
          onClick={handleTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          disabled={!canPlay}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleSkip(-15)}
          aria-label="Rewind 15 seconds"
          disabled={!canPlay}
        >
          « 15s
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleSkip(30)}
          aria-label="Forward 30 seconds"
          disabled={!canPlay}
        >
          30s »
        </Button>

        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto sm:flex-none min-w-0">
          <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
            {formatTime(effectiveCurrent)}
          </span>
          <div className="relative w-full min-w-0 select-none sm:w-56">
            <Slider
              min={0}
              max={Math.max(1, duration)}
              step={0.01}
              value={[effectiveCurrent]}
              onValueChange={(v) => handleSeekChange(v[0] ?? 0)}
              onValueCommit={(v) => handleSeekCommit(v[0] ?? 0)}
              onPointerDown={(e) => {
                const target = e.currentTarget as HTMLElement;
                const rect = target.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                const next = Math.max(0, Math.min(duration, ratio * duration));
                handleSeekStart(next);
              }}
              aria-label="Seek"
              buffered={bufferedPercent}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground whitespace-nowrap">
            {formatTime(duration)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" aria-label="Playback speed">
                {rate.toFixed(2).replace(/\.00$/, "")}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRate(r)}>
                  {r}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
};

export default AudioPlayer;
