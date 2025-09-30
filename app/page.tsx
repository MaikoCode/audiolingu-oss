import { Button } from "@/components/ui/button";

import PodcastCarousel3D from "@/components/features/carousel3d/PodcastCarousel3D";
import CoreFeatures from "@/components/features/landing/CoreFeatures";
import { Headphones } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen h-full bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-pulse-glow">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AudioLingu
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary/50 bg-transparent"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
            >
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-float"
          style={{ animationDelay: "1s" }}
        />

        <div className="container mx-auto text-center max-w-4xl relative">
          <div className="mb-12">
            <PodcastCarousel3D />
          </div>
          {/* CTA Under Carousel */}
          <div className="mt-2">
            <h2
              className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance"
              aria-label="Learn Any Language Through AI-Generated Podcasts"
              tabIndex={0}
            >
              Learn Any Language Through AI-Generated Podcasts
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Daily bite-sized episodes tailored to your level and interests.
              Learn by listening, reading, and interacting.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link
                  href="/sign-in"
                  aria-label="Get Started and begin learning"
                >
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
          {/* <div className="mt-40">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Personalized Podcasts for Every{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Language Learner
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              Get daily AI-generated podcast episodes tailored to your
              proficiency level and interests. Learn through engaging audio
              content that adapts to your progress.
            </p>
          </div> */}
        </div>
      </section>

      {/* Core Features */}
      <CoreFeatures />
    </div>
  );
}
