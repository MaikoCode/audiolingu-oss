"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type AlignmentSentence = { text: string; start: number; end: number };
export type AlignmentWord = { word: string; start: number; end: number };

export type NowPlayingData = {
  id: string;
  title: string;
  coverUrl?: string;
  audioUrl: string;
  sentences?: AlignmentSentence[];
  words?: AlignmentWord[];
};

type NowPlayingState = {
  current?: NowPlayingData;
  isOpen: boolean; // transcript sheet open
  setCurrent: (data: NowPlayingData) => void;
  openTranscript: () => void;
  closeTranscript: () => void;
};

const NowPlayingCtx = createContext<NowPlayingState | null>(null);

export const NowPlayingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [current, setCurrent] = useState<NowPlayingData | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const value = useMemo<NowPlayingState>(
    () => ({
      current,
      isOpen,
      setCurrent: (data: NowPlayingData) => setCurrent(data),
      openTranscript: () => setIsOpen(true),
      closeTranscript: () => setIsOpen(false),
    }),
    [current, isOpen]
  );

  return (
    <NowPlayingCtx.Provider value={value}>{children}</NowPlayingCtx.Provider>
  );
};

export const useNowPlaying = (): NowPlayingState => {
  const ctx = useContext(NowPlayingCtx);
  if (!ctx)
    throw new Error("useNowPlaying must be used within NowPlayingProvider");
  return ctx;
};
