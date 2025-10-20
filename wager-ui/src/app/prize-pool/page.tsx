"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LeaderboardModal } from "@/components/modals/LeaderboardModal";
import * as React from "react";

export default function PrizePoolPage() {
  const [leaderboardOpen, setLeaderboardOpen] = React.useState(false);
  const predictionPoolsData = [
    {
      id: 1,
      title: "Benfica vs Barca",
      category: "Football",
      categoryIcon: "/icon/football.svg",
      image: "/image/football.avif",
    },
    {
      id: 2,
      title: "Altman VS Elon",
      category: "World Events",
      categoryIcon: "/icon/events.svg",
      image: "/image/world_events.avif",
    },
    {
      id: 3,
      title: "Lakers VS Bulls",
      category: "World Basketball",
      categoryIcon: "/icon/basketball.svg",
      image: "/image/basketball.avif",
    },
    {
      id: 4,
      title: "Ethereum VS Solana",
      category: "Crypto",
      categoryIcon: "/icon/crypto.svg",
      image: "/image/crypto.avif",
    },
  ];

  const leaderboardData = [
    {
      id: 1,
      name: "Global User",
      points: 500,
      gradient: "from-pink-500 to-purple-500",
    },
    {
      id: 2,
      name: "Global User",
      points: 400,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      name: "Global User",
      points: 450,
      gradient: "from-yellow-500 to-green-500",
    },
    {
      id: 4,
      name: "Global User",
      points: 390,
      gradient: "from-blue-500 to-purple-500",
    },
    {
      id: 5,
      name: "Global User",
      points: 425,
      gradient: "from-yellow-500 to-pink-500",
    },
    {
      id: 6,
      name: "Global User",
      points: 375,
      gradient: "from-pink-500 to-purple-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-8">
        <div className="relative z-10 flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Image
                src="/icon/logo.svg"
                alt="WVS Logo"
                width={60}
                height={60}
                className="h-[60px] w-auto"
              />
              <div>
                <h1 className="text-[40px] font-normal text-white">
                  Global Prize Pool
                </h1>
              </div>
            </div>
            <p className="text-white/70">
              Earn entry points just for using the platform.
            </p>
          </div>
          <div className="mt-[116px] bg-white/20 rounded-lg p-4 border border-white/10">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg bg-black/10 border border-black/10 py-4 px-6 text-center flex items-center gap-2 text-[48px]">
                <label className="font-bold text-white">2,125,000</label>
                <label className="font-semibold text-[#FEDE00]">$</label>
                <label className="font-semibold text-[#1FE6E5]">VS</label>
              </div>
              <label className="text-[16px]">
                Next drawing:
                <label className="font-semibold text-[24px]"> 15:35:45</label>
              </label>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0">
          <Image
            src="/image/prize_main.avif"
            alt="Background pattern"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* How it works and Leaderboard */}
      <div className="flex justify-between items-start gap-8">
        {/* How it works */}
        <div className="flex flex-[1_1_50%] flex-col gap-4">
          <label className="text-[18px] font-semibold text-white">
            How it works
          </label>
          <div className="bg-black/10 border border-white/10 rounded-lg">
            <div className="flex items-start gap-4 p-4 border-b border-white/10">
              <Image src="/icon/dice.svg" alt="Dice" width={48} height={48} />
              <div className="flex flex-col justify-between">
                <h3 className="font-medium text-white">Predict</h3>
                <p className="text-sm text-white/70">
                  Make or create a prediction on the platform.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border-b border-white/10">
              <Image src="/icon/earn.svg" alt="Earn" width={48} height={48} />
              <div className="flex flex-col justify-between">
                <h3 className="font-medium text-white">Earn</h3>
                <p className="text-sm text-white/70">
                  Receive entry points for accuracy + platform usage.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border-b border-white/10">
              <Image src="/icon/win.svg" alt="Win" width={48} height={48} />
              <div className="flex flex-col justify-between">
                <h3 className="font-medium text-white">Win</h3>
                <p className="text-sm text-white/70">
                  Your entries are automatically submitted into the bi-weekly
                  drawing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex flex-[1_1_50%] flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="text-[18px] font-semibold text-white">
              Leaderboard
            </label>
            <Button
              onClick={() => setLeaderboardOpen(true)}
              variant="ghost"
              className="text-[#1FE6E5] p-0 h-auto font-normal hover:bg-transparent hover:text-[#1FE6E5]/80"
            >
              View All &gt;&gt;
            </Button>
          </div>
          <div className="grid grid-cols-2">
            {leaderboardData.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-black/10 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback
                      className={`bg-gradient-to-r ${user.gradient} text-white`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">
                      {user.name}
                    </div>
                    <label className="text-xs text-[#FFC940] flex gap-1 items-center">
                      {user.points} <label className="text-white">pts</label>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Prediction Pools */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-[18px] font-semibold text-white">
            Top Prediction Pools
          </label>
          <label className="text-[#1FE6E5] ">View All &gt;&gt;</label>
        </div>
        <div className="flex justify-between gap-6">
          {predictionPoolsData.map((pool) => (
            <Image
              key={pool.id}
              src={pool.image}
              alt={pool.title}
              height={800}
              width={800}
              className="w-full h-full"
            />
          ))}
        </div>
      </div>

      <LeaderboardModal
        open={leaderboardOpen}
        onOpenChange={setLeaderboardOpen}
      />
    </div>
  );
}
