"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LANGUAGES, type LanguageOption } from "./constants";

const flagStyleFor = (countryCode?: LanguageOption["countryCode"]) => {
  if (countryCode === "ES")
    return "linear-gradient(to bottom, #AA151B 33%, #F1BF00 33%, #F1BF00 66%, #AA151B 66%)";
  if (countryCode === "FR")
    return "linear-gradient(to right, #002654 33%, #FFFFFF 33%, #FFFFFF 66%, #CE1126 66%)";
  if (countryCode === "DE")
    return "linear-gradient(to bottom, #000000 33%, #DD0000 33%, #DD0000 66%, #FFCE00 66%)";
  if (countryCode === "IT")
    return "linear-gradient(to right, #009246 33%, #FFFFFF 33%, #FFFFFF 66%, #CE2B37 66%)";
  if (countryCode === "PT")
    return "linear-gradient(to right, #046A38 50%, #DA020E 50%)";
  if (countryCode === "JP")
    return "radial-gradient(circle at center, #BC002D 30%, #FFFFFF 30%)";
  if (countryCode === "KR") return "#FFFFFF";
  if (countryCode === "CN") return "#DE2910";
  return "#6B7280";
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {LANGUAGES.map((language) => (
          <Card
            key={language.code}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedLanguage === language.code
                ? "ring-2 ring-primary bg-primary/5"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onSelect(language.code)}
            role="button"
            tabIndex={0}
            aria-label={`Select ${language.name}`}
          >
            <CardContent className="p-6 text-center">
              <div className="relative mb-3">
                <div
                  className="w-12 h-8 mx-auto rounded border-2 border-gray-300 shadow-sm"
                  style={{ background: flagStyleFor(language.countryCode) }}
                >
                  {language.countryCode === "KR" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-6 h-3">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-blue-600 transform rotate-45" />
                        <div className="absolute top-0 left-0 w-3 h-3 bg-red-600 rounded-full" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 rounded-full" />
                      </div>
                    </div>
                  )}
                  {language.countryCode === "CN" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-3 h-3 bg-yellow-400 transform rotate-45"
                        style={{
                          clipPath:
                            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{language.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
