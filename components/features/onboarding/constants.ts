export type LanguageOption = {
  code: string;
  name: string;
  flag?: string;
  countryCode?: "ES" | "FR" | "DE" | "IT" | "PT" | "JP" | "KR" | "CN";
};

export type ProficiencyLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type ProficiencyOption = {
  level: ProficiencyLevel;
  title: string;
  description: string;
  details: string;
};

export type InterestOption = {
  id: string;
  name: string;
  icon: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "es", name: "Spanish", flag: "🇪🇸", countryCode: "ES" },
  { code: "fr", name: "French", flag: "🇫🇷", countryCode: "FR" },
  { code: "de", name: "German", flag: "🇩🇪", countryCode: "DE" },
  { code: "it", name: "Italian", flag: "🇮🇹", countryCode: "IT" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", countryCode: "PT" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", countryCode: "JP" },
  { code: "ko", name: "Korean", flag: "🇰🇷", countryCode: "KR" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", countryCode: "CN" },
];

export const PROFICIENCY_LEVELS: ProficiencyOption[] = [
  {
    level: "A1",
    title: "Beginner",
    description: "I'm just starting to learn this language",
    details: "Basic phrases, simple conversations",
  },
  {
    level: "A2",
    title: "Elementary",
    description: "I can handle simple, routine tasks",
    details: "Familiar topics, basic descriptions",
  },
  {
    level: "B1",
    title: "Intermediate",
    description: "I can deal with most situations while traveling",
    details: "Main points of clear topics, personal experiences",
  },
  {
    level: "B2",
    title: "Upper Intermediate",
    description: "I can interact with native speakers fairly fluently",
    details: "Complex texts, abstract topics, technical discussions",
  },
  {
    level: "C1",
    title: "Advanced",
    description: "I can use the language flexibly and effectively",
    details: "Implicit meaning, complex academic and professional topics",
  },
];

export const INTERESTS: InterestOption[] = [
  { id: "news", name: "News & Current Events", icon: "📰" },
  { id: "technology", name: "Technology", icon: "💻" },
  { id: "culture", name: "Culture & Arts", icon: "🎨" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "food", name: "Food & Cooking", icon: "🍳" },
  { id: "health", name: "Health & Wellness", icon: "🏃" },
  { id: "entertainment", name: "Entertainment", icon: "🎬" },
  { id: "history", name: "History", icon: "📚" },
  { id: "environment", name: "Environment", icon: "🌱" },
];
