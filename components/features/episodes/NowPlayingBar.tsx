"use client";

import React from "react";
import { useNowPlaying } from "./NowPlayingContext";
import AudioPlayer from "./AudioPlayer";
import TranscriptViewer from "./TranscriptViewer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const NowPlayingBar: React.FC = () => {
  const { current, isOpen, openTranscript, closeTranscript } = useNowPlaying();
  const [currentTime, setCurrentTime] = React.useState(0);
  const [seekTo, setSeekTo] = React.useState<number | undefined>(undefined);
  const [shouldAutoplay, setShouldAutoplay] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setShouldAutoplay(true);
    window.addEventListener("nowplaying:autoplay", handler as EventListener);
    return () =>
      window.removeEventListener(
        "nowplaying:autoplay",
        handler as EventListener
      );
  }, []);

  // Reset autoplay flag after source changes and first attempt to play
  React.useEffect(() => {
    if (!current) return;
    // slight delay allows audio element to mount with new src
    if (shouldAutoplay) {
      const id = setTimeout(() => setShouldAutoplay(false), 300);
      return () => clearTimeout(id);
    }
  }, [current, shouldAutoplay]);

  if (!current) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto max-w-5xl px-4 py-3 grid items-center gap-4 grid-cols-[auto_1fr_auto]">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {current.coverUrl ? (
            <Image
              src={current.coverUrl}
              alt="cover"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              🎧
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <div className="text-xs sm:text-base font-semibold truncate shrink-0 max-w-[35vw] sm:max-w-none">
            {current.title}
          </div>
          <div className="flex-1 min-w-0">
            <AudioPlayer
              src={current.audioUrl}
              title={current.title}
              onTimeChange={(t) => setCurrentTime(t)}
              seekTo={seekTo}
              autoPlay={shouldAutoplay}
              layout="inline"
              className="p-0"
            />
          </div>
        </div>

        {current.sentences?.length ? (
          <Sheet
            open={isOpen}
            onOpenChange={(o) => (o ? openTranscript() : closeTranscript())}
          >
            <SheetTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 justify-center shrink-0"
                aria-label="Toggle transcript"
              >
                🗒️ <span className="hidden sm:inline">Transcript</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-[75vh] overflow-hidden p-0">
              <div className="h-full py-4 px-4">
                <h3 className="mb-2 text-sm text-muted-foreground">
                  Transcript
                </h3>
                <div className="h-[calc(100%-2rem)]">
                  <TranscriptViewer
                    sentences={current.sentences}
                    words={current.words}
                    currentTime={currentTime}
                    onSeek={(t) => setSeekTo(t)}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
    </div>
  );
};

export default NowPlayingBar;
