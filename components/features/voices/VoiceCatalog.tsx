"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { VoiceCard, type VoiceItem } from "./VoiceCard";
import { VoiceFilters, type VoiceFiltersValue } from "./VoiceFilters";
import { Skeleton } from "@/components/ui/skeleton";

export const VoiceCatalog = ({
  initialFilters,
  selectedVoiceId,
  onSelect,
}: {
  initialFilters: VoiceFiltersValue;
  selectedVoiceId?: string | null;
  onSelect: (voiceId: string) => void;
}) => {
  const search = useAction(api.elevenlabs.searchVoices);
  const [filters, setFilters] = useState<VoiceFiltersValue>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<VoiceItem[]>([]);

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

  useEffect(() => {
    fetchVoices(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.language, filters.gender, filters.age, filters.category]);

  const handleReset = () => {
    setFilters({ language: filters.language });
  };

  const content = useMemo(() => {
    if (loading) {
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {voices.map((v) => (
          <VoiceCard
            key={v.voiceId}
            voice={v}
            selected={selectedVoiceId === v.voiceId}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }, [loading, voices, onSelect, selectedVoiceId]);

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
