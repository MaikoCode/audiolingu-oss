"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { VoiceCard, type VoiceItem } from "./VoiceCard";
import { VoiceFilters, type VoiceFiltersValue } from "./VoiceFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const VoiceCatalog = ({
  initialFilters,
  selectedVoiceId,
  onSelect,
  initialVoices,
}: {
  initialFilters: VoiceFiltersValue;
  selectedVoiceId?: string | null;
  onSelect: (voiceId: string) => void;
  initialVoices?: VoiceItem[] | null;
}) => {
  const search = useAction(api.elevenlabs.searchVoices);
  const [filters, setFilters] = useState<VoiceFiltersValue>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<VoiceItem[]>(initialVoices ?? []);
  const [showAll, setShowAll] = useState(false);

  const fetchVoices = async (f: VoiceFiltersValue) => {
    setLoading(true);
    try {
      const res = await search({
        language: f.language,
        gender: f.gender,
        age: f.age,
        category: f.category,
      });
      setVoices(res.voices as VoiceItem[]);
    } finally {
      setLoading(false);
    }
  };

  // Seed from initialVoices if provided and nothing loaded yet
  useEffect(() => {
    if (voices.length === 0 && initialVoices && initialVoices.length > 0) {
      setVoices(initialVoices);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVoices]);

  // Fetch on any filter change; show skeletons only if no voices yet
  useEffect(() => {
    setShowAll(false);
    fetchVoices(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.language, filters.gender, filters.age, filters.category]);

  // Sync internal filters when parent initialFilters (from user settings) changes
  useEffect(() => {
    if (!initialFilters?.language) return;
    if (initialFilters.language === filters.language) return;
    setFilters(initialFilters);
    setShowAll(false);
  }, [initialFilters, filters.language]);

  const handleReset = () => {
    setFilters({ language: filters.language });
  };

  const handleToggleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  const content = useMemo(() => {
    if (loading && voices.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      );
    }
    if (!voices.length) {
      return (
        <div className="text-sm text-muted-foreground">No voices found.</div>
      );
    }
    const displayedVoices = showAll ? voices : voices.slice(0, 10);
    const canExpand = voices.length > 10;
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedVoices.map((v) => (
            <VoiceCard
              key={v.voiceId}
              voice={v}
              selected={selectedVoiceId === v.voiceId}
              onSelect={onSelect}
            />
          ))}
        </div>
        {canExpand ? (
          <div className="flex items-center justify-center pt-2">
            <Button
              type="button"
              onClick={handleToggleShowAll}
              aria-label={showAll ? "Show fewer voices" : "Show all voices"}
            >
              {showAll ? "Show less" : `Show all ${voices.length - 10} more`}
            </Button>
          </div>
        ) : null}
      </>
    );
  }, [loading, voices, onSelect, selectedVoiceId, showAll]);

  return (
    <div className="space-y-4">
      <VoiceFilters
        value={filters}
        onChange={setFilters}
        onReset={handleReset}
      />
      {content}
    </div>
  );
};
