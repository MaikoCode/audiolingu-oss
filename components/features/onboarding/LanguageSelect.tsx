"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LANGUAGES } from "./constants";
import FlagIcon from "./FlagIcon";
import { cn } from "@/lib/utils";

const handleKeyDown = (
  event: React.KeyboardEvent,
  onSelect: (code: string) => void,
  code: string
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect(code);
  }
};

export const LanguageSelect = ({
  selectedLanguage,
  onSelect,
}: {
  selectedLanguage: string;
  onSelect: (code: string) => void;
}) => {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-foreground mb-4">
        Which language would you like to learn?
      </h2>
      <p className="text-lg text-muted-foreground mb-8">
        Choose the language you want to focus on
      </p>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        role="radiogroup"
        aria-label="Language options"
      >
        {LANGUAGES.map((language) => (
          <Card
            key={language.code}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md focus:outline-none",
              selectedLanguage === language.code
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            )}
            onClick={() => onSelect(language.code)}
            role="radio"
            aria-checked={selectedLanguage === language.code}
            tabIndex={0}
            aria-label={`Select ${language.name}`}
            onKeyDown={(e) => handleKeyDown(e, onSelect, language.code)}
          >
            <CardContent className="p-6 text-center">
              <div className="relative mb-3 flex items-center justify-center">
                <FlagIcon
                  countryCode={language.countryCode}
                  title={`${language.name} flag`}
                />
              </div>
              <h3 className="font-semibold text-foreground">{language.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
