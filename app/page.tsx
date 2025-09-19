import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Headphones,
  Globe,
  TrendingUp,
  Mic,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Browse
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              My Learning
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Progress
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-primary/10 hover:border-primary/50 bg-transparent"
            >
              Sign In
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
          <Badge
            variant="secondary"
            className="mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Language Learning
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Personalized Podcasts for Every{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Language Learner
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Get daily AI-generated podcast episodes tailored to your proficiency
            level and interests. Learn through engaging audio content that
            adapts to your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              asChild
            >
              <Link href="/sign-in">
                <Play className="w-5 h-5 mr-2" />
                Start Learning
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
            >
              <Mic className="w-5 h-5 mr-2" />
              Listen to Sample
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Why Choose AudioLingu?
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of language learning with personalized,
              AI-generated content
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-primary">
                  Personalized Content
                </CardTitle>
                <CardDescription>
                  AI generates episodes based on your proficiency level and
                  interests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-secondary">
                  Adaptive Learning
                </CardTitle>
                <CardDescription>
                  Content difficulty adjusts as you progress through language
                  levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-accent">Daily Episodes</CardTitle>
                <CardDescription>
                  Fresh content every day to build consistent learning habits
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Podcasts */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Sample Episodes
            </h3>
            <p className="text-muted-foreground text-lg">
              Explore what personalized learning sounds like
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Beginner A1
                  </Badge>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    Spanish
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  Daily Routines
                </CardTitle>
                <CardDescription>
                  Learn basic vocabulary about morning routines and daily
                  activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">8 min</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Intermediate B1
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    French
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  Tech News Digest
                </CardTitle>
                <CardDescription>
                  Stay updated with technology trends while improving your
                  French
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">12 min</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200"
                  >
                    Advanced C1
                  </Badge>
                  <Badge className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                    German
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  Cultural Insights
                </CardTitle>
                <CardDescription>
                  Deep dive into German culture and contemporary social issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">15 min</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 animate-gradient" />
        <div className="container mx-auto text-center max-w-3xl relative">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Ready to Transform Your Language Learning?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of learners who are already improving their language
            skills with personalized AI-generated podcasts.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            asChild
          >
            <Link href="/onboarding">
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Journey
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center">
                <Headphones className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AudioLingu
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 AudioLingu. Empowering language learners worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
