"use client";

import type { LanguageOption } from "./constants";
import { cn } from "@/lib/utils";
import {
  ES as FlagES,
  FR as FlagFR,
  DE as FlagDE,
  IT as FlagIT,
  PT as FlagPT,
  JP as FlagJP,
  KR as FlagKR,
  CN as FlagCN,
} from "country-flag-icons/react/3x2";

type FlagIconProps = {
  countryCode: LanguageOption["countryCode"];
  className?: string;
  title?: string;
};

export const FlagIcon = ({ countryCode, className, title }: FlagIconProps) => {
  const FlagComponent =
    countryCode === "ES"
      ? FlagES
      : countryCode === "FR"
        ? FlagFR
        : countryCode === "DE"
          ? FlagDE
          : countryCode === "IT"
            ? FlagIT
            : countryCode === "PT"
              ? FlagPT
              : countryCode === "JP"
                ? FlagJP
                : countryCode === "KR"
                  ? FlagKR
                  : countryCode === "CN"
                    ? FlagCN
                    : null;

  if (!FlagComponent) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded border-2 border-gray-300 shadow-sm",
          "w-12 h-8",
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded border-2 border-gray-300 shadow-sm",
        "w-12 h-8",
        className
      )}
      aria-hidden
    >
      <FlagComponent className="w-full h-full" title={title} />
    </div>
  );
};

export default FlagIcon;
