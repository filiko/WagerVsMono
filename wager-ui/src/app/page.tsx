"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Trophy,
  Star,
  TrendingUp,
  Zap,
  Users,
  Target,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { usePredictions } from "@/hooks/usePredictions";

const featuredPredictions = [
  {
    id: "1",
    title: "Benfica vs Barcelona",
    subtitle: "Champions League Quarter-Final",
    category: "Football",
    image: "/image/benfica_vs_barcelona.avif",
    leftTeam: {
      name: "Benfica",
      logo: "/icon/benfica.svg",
      color: "from-red-500 to-red-700",
      odds: "2.1",
    },
    rightTeam: {
      name: "Barcelona",
      logo: "/icon/barcelona.svg",
      color: "from-blue-500 to-red-500",
      odds: "1.8",
    },
    timeLeft: "2d 14h 32m",
    totalPool: "2.4M $VS",
    participants: 1847,
    isFeatured: true,
    isLive: true,
  },
  {
    id: "2",
    title: "Altman vs Musk",
    subtitle: "AI Leadership Battle",
    category: "Finance",
    image: "/image/altman_vs_musk.avif",
    leftTeam: {
      name: "Sam Altman",
      logo: "/icon/altman-logo.svg",
      color: "from-blue-600 to-purple-600",
      odds: "1.5",
    },
    rightTeam: {
      name: "Elon Musk",
      logo: "/icon/musk-logo.svg",
      color: "from-gray-600 to-gray-800",
      odds: "2.3",
    },
    timeLeft: "5d 8h 15m",
    totalPool: "1.8M $VS",
    participants: 1203,
    isFeatured: true,
    isLive: false,
  },
];

const regularPredictions = [
  {
    id: "3",
    title: "Atletico vs Real Madrid",
    subtitle: "La Liga Clásico",
    category: "Football",
    image: "/image/atletico_vs_real_madrid.avif",
    leftTeam: {
      name: "Atletico",
      logo: "/icon/atletico_de_madrid.svg",
      color: "from-red-500 to-white",
      odds: "2.4",
    },
    rightTeam: {
      name: "Real Madrid",
      logo: "/icon/real_madrid.svg",
      color: "from-white to-blue-600",
      odds: "1.6",
    },
    timeLeft: "1094h 23m 0s",
    progress: 60,
    leadingTeam: "Real Madrid",
    isFrontRunner: true,
    multiplier: "2x points",
    totalPool: "850K $VS",
    participants: 892,
  },
  {
    id: "4",
    title: "Atletico vs Real Madrid",
    subtitle: "La Liga Clásico",
    category: "Football",
    image: "/image/atletico_vs_real_madrid.avif",
    leftTeam: {
      name: "Atletico",
      logo: "/icon/atletico_de_madrid.svg",
      color: "from-red-500 to-white",
      odds: "2.4",
    },
    rightTeam: {
      name: "Real Madrid",
      logo: "/icon/real_madrid.svg",
      color: "from-white to-blue-600",
      odds: "1.6",
    },
    timeLeft: "1094h 23m 0s",
    progress: 60,
    leadingTeam: "Real Madrid",
    isFrontRunner: true,
    multiplier: "2x points",
    totalPool: "850K $VS",
    participants: 892,
  },
  {
    id: "5",
    title: "Atletico vs Real Madrid",
    subtitle: "La Liga Clásico",
    category: "Football",
    image: "/image/atletico_vs_real_madrid.avif",
    leftTeam: {
      name: "Atletico",
      logo: "/icon/atletico_de_madrid.svg",
      color: "from-red-500 to-white",
      odds: "2.4",
    },
    rightTeam: {
      name: "Real Madrid",
      logo: "/icon/real_madrid.svg",
      color: "from-white to-blue-600",
      odds: "1.6",
    },
    timeLeft: "1094h 23m 0s",
    progress: 60,
    leadingTeam: "Real Madrid",
    isFrontRunner: true,
    multiplier: "2x points",
    totalPool: "850K $VS",
    participants: 892,
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { predictions, loading, error } = usePredictions();

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTotalPool = (side1Amount: number, side2Amount: number) => {
    const total = side1Amount + side2Amount;
    if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M $VS`;
    if (total >= 1000) return `${(total / 1000).toFixed(0)}K $VS`;
    return `${total} $VS`;
  };

  const getParticipants = (side1Amount: number, side2Amount: number) => {
    return (
      Math.floor((side1Amount + side2Amount) / 100) +
      Math.floor(Math.random() * 500)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] via-[#16213e] to-[#0a0a0f] text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-sm font-medium">Live Predictions</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              PREDICT
            </span>
            <br />
            <span className="text-white/90 text-2xl sm:text-4xl md:text-5xl font-light">
              WIN BIG
            </span>
          </h1>

          <p className="text-base sm:text-xl text-white/70 max-w-3xl mx-auto mb-8 leading-relaxed px-1">
            Join the ultimate prediction platform where skill meets reward.
            Compete with thousands of players for massive prize pools.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-2 text-sm">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium">12,847 Active Players</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">
                $2.4M Total Prize Pool
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-2 text-sm">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium">89% Accuracy Rate</span>
            </div>
          </div>

          <div className="navbar-connect-button-container navbar-glow-teal mb-8">
            <div className="navbar-connect-glow navbar-connect-glow-sm" />
            <div className="navbar-connect-main-button">
              <div className="navbar-grain-overlay" />
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/25">
                Start Predicting Now
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-medium">Featured Matches</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 via-purple-400/30 to-transparent"></div>
          </div>
          <div className="md:hidden">
            <Image
              src="/image/benfica_vs_barcelona.avif"
              alt="Featured Match"
              width={1200}
              height={675}
              className="w-full h-48 rounded-xl object-cover"
            />
          </div>
          <div className="hidden md:flex gap-4">
            <Image
              src="/image/benfica_vs_barcelona.avif"
              alt="Featured Matches"
              width={1000}
              height={1000}
              className="h-[420px] rounded-xl object-cover"
            />
            <Image
              src="/image/altman_vs_musk.avif"
              alt="Featured Matches"
              width={1000}
              height={1000}
              className="h-[420px] rounded-xl object-cover"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <h2 className="text-3xl font-medium">Active Predictions</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 via-purple-400/30 to-transparent"></div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Failed to load predictions</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Try Again
              </Button>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 mb-4">
                No active predictions available
              </p>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                Create First Prediction
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predictions.map((prediction) => (
                <Link
                  key={prediction.id}
                  href={`/prediction/${prediction.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm hover:border-cyan-400/40 transition-all duration-500 hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/10 block"
                  onMouseEnter={() => setHoveredCard(prediction.id.toString())}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="z-20 absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeLeft(prediction.wagerEndTime)}
                  </div>

                  <div className="relative h-48 overflow-hidden">
                    {prediction.imageUrl ? (
                      <Image
                        src={`${
                          process.env.NEXT_PUBLIC_API_URL ||
                          "http://localhost:5000"
                        }/api${prediction.imageUrl}`}
                        alt={prediction.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-white/60 text-lg font-medium">
                          No Image
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-center gap-6 mb-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-3 shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {prediction.side1.charAt(0)}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">
                            {prediction.side1}
                          </div>
                          <div className="text-xs text-white/60">
                            Amount: {prediction.side1Amount} $VS
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg px-4 py-2">
                        <span className="font-medium text-lg">VS</span>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center p-3 shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {prediction.side2.charAt(0)}
                          </span>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-sm">
                            {prediction.side2}
                          </div>
                          <div className="text-xs text-white/60">
                            Amount: {prediction.side2Amount} $VS
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-2 text-center">
                      {prediction.name}
                    </h3>
                    {prediction.description && (
                      <p className="text-sm text-white/60 text-center mb-4">
                        {prediction.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-4 text-xs">
                      <span className="text-white/60">
                        Pool:{" "}
                        {getTotalPool(
                          prediction.side1Amount,
                          prediction.side2Amount
                        )}
                      </span>
                      <span className="text-white/60">
                        {getParticipants(
                          prediction.side1Amount,
                          prediction.side2Amount
                        )}{" "}
                        players
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-gradient-to-r from-purple-500/80 to-purple-600/80 hover:from-purple-500 hover:to-purple-600 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 text-sm">
                        {prediction.side1}
                      </Button>
                      <Button className="flex-1 bg-gradient-to-r from-cyan-500/80 to-cyan-600/80 hover:from-cyan-500 hover:to-cyan-600 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:scale-105 text-sm">
                        {prediction.side2}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-20 text-center">
          <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-400/20 rounded-3xl p-12">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 animate-pulse"></div>

            <div className="relative z-10">
              <Award className="w-16 h-16 text-cyan-400 mx-auto mb-6 animate-bounce" />
              <h3 className="text-4xl font-medium mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Ready to Dominate?
              </h3>
              <p className="text-white/70 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
                Join the elite prediction community and compete for massive
                rewards. Your next big win is just one prediction away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="navbar-connect-button-container navbar-glow-teal">
                  <div className="navbar-connect-glow navbar-connect-glow-sm" />
                  <div className="navbar-connect-main-button">
                    <div className="navbar-grain-overlay" />
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg transition-all duration-300 hover:scale-105 sm:hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/25">
                      Create Your First Prediction
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/10 font-medium px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105"
                >
                  View Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
