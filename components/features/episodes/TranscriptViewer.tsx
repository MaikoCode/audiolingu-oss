"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type Sentence = { text: string; start: number; end: number };
type Word = { word: string; start: number; end: number };

type TranscriptViewerProps = {
  sentences: Sentence[];
  words?: Word[];
  currentTime: number;
  onSeek?: (time: number) => void;
  className?: string;
};

const isWithin = (t: number, start: number, end: number) => {
  if (!Number.isFinite(t) || !Number.isFinite(start) || !Number.isFinite(end))
    return false;
  return t >= start && t <= end + 0.01; // slight tolerance
};

const findActiveIndex = (
  time: number,
  arr: { start: number; end: number }[]
) => {
  // binary search for performance on long transcripts
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const item = arr[mid];
    if (time < item.start) hi = mid - 1;
    else if (time > item.end) lo = mid + 1;
    else return mid;
  }
  return Math.max(0, Math.min(arr.length - 1, lo));
};

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  sentences,
  words = [],
  currentTime,
  onSeek,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Filter out empty/punctuation-only sentences
  const filteredSentences = useMemo(() => {
    return sentences.filter((s) => {
      const cleaned = (s.text || "")
        .replace(/[\s\u00A0]+/g, " ")
        .replace(/[.?!…]+/g, "")
        .trim();
      return (
        cleaned.length > 0 && Number.isFinite(s.start) && Number.isFinite(s.end)
      );
    });
  }, [sentences]);

  const activeSentenceIndex = useMemo(
    () => findActiveIndex(currentTime, filteredSentences),
    [currentTime, filteredSentences]
  );

  const wordsBySentence = useMemo(() => {
    if (!words.length) return [] as Word[][];
    const tokens = words.filter(
      (w) => !/^\s*$/.test(w.word) && !/^[.?!…]+$/.test(w.word)
    );
    return filteredSentences.map((s) =>
      tokens.filter((w) => !(w.end < s.start || w.start > s.end))
    );
  }, [filteredSentences, words]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLDivElement>(
      `[data-sent-idx="${activeSentenceIndex}"]`
    );
    if (!active) return;
    const rect = active.getBoundingClientRect();
    const parentRect = el.getBoundingClientRect();
    const isInView =
      rect.top >= parentRect.top && rect.bottom <= parentRect.bottom;
    if (!isInView)
      active.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSentenceIndex]);

  // Cosmetic: collapse excessive spaces and stray punctuation when rendering sentence text only
  const cleanText = (text: string) =>
    text
      .replace(/[\u00A0\s]+/g, " ") // collapse whitespace including nbsp
      .replace(/\s*([,;:!?…])\s*/g, "$1 ") // normalize spacing around punctuation
      .replace(/\s*([.]{2,})\s*/g, " … ") // collapse ellipses
      .replace(/^\s*\.+\s*$/g, "") // remove dot-only lines
      .trim();

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full max-h-full overflow-y-auto rounded-md border p-4 text-base leading-8",
        "bg-background",
        className
      )}
      role="region"
      aria-label="Transcript"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          const next = Math.min(sentences.length - 1, activeSentenceIndex + 1);
          const t = sentences[next]?.start;
          if (onSeek && Number.isFinite(t)) onSeek(t);
        }
        if (e.key === "ArrowUp") {
          const prev = Math.max(0, activeSentenceIndex - 1);
          const t = sentences[prev]?.start;
          if (onSeek && Number.isFinite(t)) onSeek(t);
        }
      }}
    >
      {filteredSentences.map((s, i) => {
        const isActive = isWithin(currentTime, s.start, s.end);
        const sentenceWords = wordsBySentence[i] ?? [];
        return (
          <div
            key={`${s.start}-${i}`}
            data-sent-idx={i}
            className={cn(
              "rounded px-2 py-1 cursor-pointer",
              isActive && "bg-primary/10 ring-1 ring-primary/30"
            )}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSeek?.(s.start)}
          >
            {sentenceWords.length > 0 ? (
              <span className="flex flex-wrap gap-x-1 gap-y-0.5">
                {sentenceWords.map((w, wi) => {
                  const activeWord = isWithin(currentTime, w.start, w.end);
                  return (
                    <button
                      key={`${w.start}-${wi}`}
                      type="button"
                      className={cn(
                        "px-1 rounded focus:outline-none focus:ring-1 focus:ring-primary/50",
                        activeWord ? "bg-secondary/60" : "hover:bg-muted"
                      )}
                      aria-label={`Seek to ${w.word}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek?.(w.start);
                      }}
                    >
                      {w.word}
                    </button>
                  );
                })}
              </span>
            ) : (
              <span>{cleanText(s.text)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TranscriptViewer;
