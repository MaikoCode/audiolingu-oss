"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  topic: string;
  date: string;
  isNew: boolean;
  progress: number;
  coverImage: string;
}

const mockEpisodes: PodcastEpisode[] = [
  {
    id: "1",
    title: "Morning Routines Around the World",
    description:
      "Discover how people start their day in different cultures while learning essential vocabulary.",
    duration: "8:32",
    difficulty: "A1",
    topic: "Culture",
    date: "Today",
    isNew: true,
    progress: 0,
    coverImage: "/images/culture-cover.jpg",
  },
  {
    id: "2",
    title: "Tech Trends: AI in Daily Life",
    description:
      "Explore how artificial intelligence is changing our everyday experiences.",
    duration: "12:15",
    difficulty: "A1",
    topic: "Technology",
    date: "Yesterday",
    isNew: false,
    progress: 100,
    coverImage: "/images/tech-cover.jpg",
  },
  {
    id: "3",
    title: "Healthy Cooking Tips",
    description:
      "Learn about nutritious ingredients and simple cooking techniques.",
    duration: "10:45",
    difficulty: "A1",
    topic: "Food",
    date: "2 days ago",
    isNew: false,
    progress: 45,
    coverImage: "/images/food-cover.jpg",
  },
];

export default function DashboardPage() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const togglePlay = (episodeId: string) => {
    setCurrentlyPlaying(currentlyPlaying === episodeId ? null : episodeId);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🎧</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AudioLingu
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/app">
            <Button
              variant="ghost"
              className="w-full justify-start bg-primary/10 text-primary"
            >
              <span className="mr-3">🏠</span>
              Dashboard
            </Button>
          </Link>

          <Link href="/browse">
            <Button variant="ghost" className="w-full justify-start">
              <span className="mr-3">🔍</span>
              Browse Episodes
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start">
              <span className="mr-3">⚙️</span>
              Settings
            </Button>
          </Link>
        </nav>

        {/* Learning Stats */}

        {/* User Profile */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                <span>👤</span>
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Language Learner</p>
              <p className="text-xs text-muted-foreground">Premium Member</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back! ✨</h2>
          <p className="text-muted-foreground">
            Continue your learning journey with today&apos;s personalized
            episodes.
          </p>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* Generate New Episode */}
          <Card className="border-secondary/30 bg-gradient-to-br from-secondary/10 to-accent/10">
            <CardHeader>
              <CardTitle className="text-xl">
                Want Something Specific? ✨
              </CardTitle>
              <CardDescription>
                Generate a custom episode on any topic you choose
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create personalized episodes beyond your daily content.
                    Choose your own topics and get instant AI-generated lessons.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>✨ Custom topics</span>
                    <span>•</span>
                    <span>🎯 Your level</span>
                    <span>•</span>
                    <span>⚡ Instant generation</span>
                  </div>
                </div>
                <Link href="/generate">
                  <Button className="bg-gradient-to-r from-secondary to-accent">
                    ✨ Generate Episode
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Today's Episode */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Today&apos;s Daily Episode
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
                      Auto-Generated
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Your personalized daily learning content
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-secondary to-accent text-white animate-pulse">
                  New
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={mockEpisodes[0].coverImage || "/placeholder.svg"}
                    alt={`Cover for ${mockEpisodes[0].title}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">
                    {mockEpisodes[0].title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {mockEpisodes[0].description}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {mockEpisodes[0].difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <span>🕒</span>
                      {mockEpisodes[0].duration}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {mockEpisodes[0].topic}
                    </span>
                  </div>
                  <Button
                    onClick={() => togglePlay(mockEpisodes[0].id)}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    {currentlyPlaying === mockEpisodes[0].id ? (
                      <>
                        <span className="mr-2">⏸️</span>
                        Pause
                      </>
                    ) : (
                      <>
                        <span className="mr-2">▶️</span>
                        Play Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Episodes */}
          <Card>
            <CardHeader>
              <CardTitle>Your Episode Library</CardTitle>
              <CardDescription>
                Daily episodes and your custom generations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEpisodes.slice(1).map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <Image
                      src={episode.coverImage || "/placeholder.svg"}
                      alt={`Cover for ${episode.title}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{episode.title}</h4>
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Daily
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {episode.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        {episode.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>🕒</span>
                        {episode.duration}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {episode.date}
                      </span>
                    </div>
                    {episode.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={episode.progress} className="h-1" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePlay(episode.id)}
                      className="hover:bg-primary/10"
                    >
                      {currentlyPlaying === episode.id ? (
                        <span>⏸️</span>
                      ) : (
                        <span>▶️</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50"
                    >
                      <span>❤️</span>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <span>⬇️</span>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
