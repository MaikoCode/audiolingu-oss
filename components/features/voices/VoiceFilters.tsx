"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export type VoiceFiltersValue = {
  language: string;
  gender?: "male" | "female" | "neutral";
  age?: "young" | "middle_aged" | "old";
  category?: "professional" | "high_quality";
};

export const VoiceFilters = ({
  value,
  onChange,
  onReset,
}: {
  value: VoiceFiltersValue;
  onChange: (value: VoiceFiltersValue) => void;
  onReset: () => void;
}) => {
  const handleSet = (key: keyof VoiceFiltersValue, val: string | undefined) => {
    const next = { ...value, [key]: val } as VoiceFiltersValue;
    onChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Filter gender">
            Gender
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSet("gender", undefined)}>
            Any
          </DropdownMenuItem>
          {(["male", "female", "neutral"] as const).map((g) => (
            <DropdownMenuItem key={g} onClick={() => handleSet("gender", g)}>
              {g}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Filter age">
            Age
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSet("age", undefined)}>
            Any
          </DropdownMenuItem>
          {(["young", "middle_aged", "old"] as const).map((a) => (
            <DropdownMenuItem key={a} onClick={() => handleSet("age", a)}>
              {a}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Filter category">
            Category
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleSet("category", undefined)}>
            Any
          </DropdownMenuItem>
          {(["professional", "high_quality"] as const).map((c) => (
            <DropdownMenuItem key={c} onClick={() => handleSet("category", c)}>
              {c}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {(value.gender || value.age || value.category) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          aria-label="Reset filters"
        >
          Reset
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-1">
        {value.gender && <Badge variant="outline">{value.gender}</Badge>}
        {value.age && <Badge variant="outline">{value.age}</Badge>}
        {value.category && <Badge variant="outline">{value.category}</Badge>}
      </div>
    </div>
  );
};
