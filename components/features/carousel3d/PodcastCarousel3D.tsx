"use client";

import Carousel3D, { type CarouselItem } from "./Carousel3D";

interface PodcastEpisode {
  id: string;
  title: string;
  language: string;
  difficulty: string;
  cover: string;
  description: string;
}

const episodes: PodcastEpisode[] = [
  {
    id: "1",
    title: "Spanish Culture Deep Dive",
    language: "Spanish",
    difficulty: "Intermediate",
    cover: "/podcasts/abstract.jpg",
    description: "Explore the rich traditions of Spanish culture",
  },
  {
    id: "2",
    title: "French Tech Innovation",
    language: "French",
    difficulty: "Advanced",
    cover: "/podcasts/coffee.jpg",
    description: "Discover the latest in French technology",
  },
  {
    id: "3",
    title: "Italian Food Journey",
    language: "Italian",
    difficulty: "Beginner",
    cover: "/podcasts/cosmic.jpg",
    description: "A culinary adventure through Italy",
  },
  {
    id: "4",
    title: "German Business Insights",
    language: "German",
    difficulty: "Advanced",
    cover: "/podcasts/vintage_pink.jpg",
    description: "Understanding German business culture",
  },
  {
    id: "5",
    title: "Portuguese Music Scene",
    language: "Portuguese",
    difficulty: "Intermediate",
    cover: "/podcasts/jungle.jpg",
    description: "Exploring Portuguese musical traditions",
  },
];

export default function PodcastCarousel3D() {
  const carouselItems: CarouselItem[] = episodes.map((episode) => ({
    id: episode.id,
    title: episode.title,
    subtitle: `${episode.language} • ${episode.difficulty}`,
    cover: episode.cover,
    description: episode.description,
  }));

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
