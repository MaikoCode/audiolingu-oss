"use client";

import Carousel3D, { type CarouselItem } from "./Carousel3D";

type ProvidedEpisode = {
  language: string;
  level: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
};

const providedEpisodes: ProvidedEpisode[] = [
  {
    language: "Spanish",
    level: "Beginner",
    title: "Frases útiles para viajar",
    audioUrl:
      "https://images.audiolingu.com/audio/ElevenLabs_2025-09-29T23_52_29_LUISA%20-%20PRESENTADORA%20NOTICIAS%20NARRACION%20PROFESIONAL_pvc_sp100_s50_sb75_se0_b_m2.mp3",
    imageUrl: "https://images.audiolingu.com/images/spanish.png",
  },
  {
    language: "French",
    level: "Intermediate",
    title: "Découvrir la gastronomie française",
    audioUrl:
      "https://images.audiolingu.com/audio/Alain%20-%20Pro%20Expressive%20Conversational%20Dialogue%20Radio%20Youtube%20French%20Premium%20HQ%20Speak%20Clear%20Voice_qGFBDhxi0BGK3tDEWOyo.mp3",
    imageUrl: "https://images.audiolingu.com/images/french.png",
  },
  {
    language: "German",
    level: "Advanced",
    title: "Deutsche Geschäftskultur",
    audioUrl:
      "https://images.audiolingu.com/audio/Emilia%20-%20Sweet%20German%20Soul_sJQLi0CS6wr86rudR71V.mp3",
    imageUrl: "https://images.audiolingu.com/images/german.png",
  },
  {
    language: "Italian",
    level: "Beginner/Intermediate",
    title: "Espressioni italiane quotidiane",
    audioUrl:
      "https://images.audiolingu.com/audio/Sami%20-%20Italian%20News%20Anchorwoman_xPAOvwj5d5YTknAl2tlS.mp3",
    imageUrl: "https://images.audiolingu.com/images/italian.png",
  },
  {
    language: "Portuguese",
    level: "Intermediate",
    title: "O ritmo do samba brasileiro",
    audioUrl:
      "https://images.audiolingu.com/audio/Tiago%20-%20European%20Portuguese_J83cyRDa1oYRYOBl7VQQ.mp3",
    imageUrl: "https://images.audiolingu.com/images/portuguese.png",
  },
  {
    language: "Japanese",
    level: "Beginner",
    title: "基本のあいさつ",
    audioUrl:
      "https://images.audiolingu.com/audio/Yui%20-%20Japanese%20girl%20female%20Anime%20voice_PAZf069swrDSkvR138zc.mp3",
    imageUrl: "https://images.audiolingu.com/images/japanese.png",
  },
  {
    language: "Korean",
    level: "Intermediate",
    title: "한국의 카페 문화",
    audioUrl:
      "https://images.audiolingu.com/audio/Rumi%20KoreanOh_q5ss1j2UtDKiwseaBgS4.mp3",
    imageUrl: "https://images.audiolingu.com/images/korean.png",
  },
  {
    language: "Chinese",
    level: "Advanced",
    title: "中国网络流行语",
    audioUrl:
      "https://images.audiolingu.com/audio/Jason%20Chen%20-%20Chinese_wtgxDJKBBmk5CYX0aKlm.mp3",
    imageUrl: "https://images.audiolingu.com/images/chinese.png",
  },
];

export default function PodcastCarousel3D() {
  const carouselItems: CarouselItem[] = providedEpisodes.map(
    (episode, idx) => ({
      id: String(idx + 1),
      title: episode.title,
      subtitle: `${episode.language} • ${episode.level}`,
      cover: episode.imageUrl,
      audioUrl: episode.audioUrl,
    })
  );

  const handleItemChange = (item: CarouselItem) => {
    console.log("Current episode:", item.title);
  };

  const handleItemClick = (item: CarouselItem) => {
    console.log("Clicked episode:", item.title);
  };

  return (
    <Carousel3D
      items={carouselItems}
      onItemChange={handleItemChange}
      onItemClick={handleItemClick}
      showControls={true}
      showInfo={true}
      className="mb-12"
      containerHeight="320px"
      centerItemWidth={240}
      centerItemHeight={240}
      sideItemWidth={85}
      sideItemHeight={85}
      radius={315}
      centerScale={0.8}
      centerZOffset={-28}
      dragSensitivity={0.5}
    />
  );
}
