"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EpisodeCard } from "@/components/features/episodes/EpisodeCard";
import { Button } from "@/components/ui/button";
import type { Doc } from "@/convex/_generated/dataModel";

type Episode = Doc<"episodes">;

export default function EpisodesPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<Episode[]>([]);
  const page = useQuery(api.episodes.myEpisodesPaginated, {
    paginationOpts: { cursor, numItems: 10 },
  });

  useEffect(() => {
    if (!page) return;
    setItems((prev) => {
      const existingIds = new Set(prev.map((e) => e._id));
      const merged = [...prev];
      for (const ep of page.page) {
        if (!existingIds.has(ep._id)) merged.push(ep);
      }
      return merged;
    });
  }, [page, page?.continueCursor]);

  const canLoadMore = useMemo(() => page && !page.isDone, [page]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-4 pb-24">
      <h1 className="text-2xl font-semibold">All Episodes</h1>
      <div className="space-y-4">
        {items.map((ep) => (
          <EpisodeCard key={ep._id} episode={ep} />
        ))}
      </div>
      <div className="flex justify-center py-4">
        {canLoadMore ? (
          <Button
            onClick={() => setCursor(page?.continueCursor ?? null)}
            variant="secondary"
          >
            Load more
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">
            No more episodes
          </span>
        )}
      </div>
    </div>
  );
}
