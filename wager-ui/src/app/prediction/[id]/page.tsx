"use client";

import Image from "next/image";
import { useState, use } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePrediction } from "@/hooks/usePrediction";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";
import {
  Clock,
  Trophy,
  Star,
  TrendingUp,
  ThumbsUp,
  Share2,
  Send,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const predictionData = {
  id: "atletico-vs-real-madrid",
  title: "Atletico vs Real Madrid 4/8",
  league: "UEFA Champions League",
  timeLeft: "1094h 23m 0s",
  isFrontRunner: true,
  multiplier: "2x points",
  leftTeam: {
    name: "Atletico",
    logo: "/icon/atletico_de_madrid.svg",
    color: "from-red-500 to-white",
    odds: "2.4",
    prediction: 40,
  },
  rightTeam: {
    name: "Real Madrid",
    logo: "/icon/real_madrid.svg",
    color: "from-white to-blue-600",
    odds: "1.6",
    prediction: 60,
  },
  image: "/image/atletico_vs.png",
  totalPool: "850K $VS",
  participants: 892,
  aiInsight: {
    summary:
      "Based on recent team form, player performance metrics, and historical head-to-head stats, Real Madrid is predicted to have a higher chance of winning.",
    reasons: [
      "Real Madrid has averaged 2.1 goals per game in their last 5 matches, while Atletico has struggled defensively, conceding 1.8 goals on average.",
      "Additionally, Madrid has won 3 of the last 4 derbies.",
    ],
    confidence: 60,
  },
  lastTrades: [
    {
      id: "1",
      user: "Placed 1500 $VS ($225)",
      team: "Real Madrid",
      time: "1m ago",
      image: "/image/atletico_vs_real_madrid.avif",
    },
  ],
  comments: [
    {
      id: "1",
      user: "@bizops",
      message: "LETSGOOO REAL MADRID",
      time: "10 minutes ago",
    },
    {
      id: "2",
      user: "@bizops",
      message: "LETSGOOO REAL MADRID",
      time: "10 minutes ago",
    },
  ],
};

export default function PredictionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, loading } = useAuth();
  const resolvedParams = use(params);
  const {
    prediction,
    loading: predictionLoading,
    error,
    submitting,
    makePrediction,
  } = usePrediction(resolvedParams.id);
  const { refreshBalances, balances } = useWalletBalance();
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [amount, setAmount] = useState("100");
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(true);

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setAmount(cleaned);
  };

  const handlePercentageAdd = (percentage: number) => {
    const total = 10000; // Default balance for now
    const totalInt = Math.floor(total);
    const increment = Math.floor((totalInt * percentage) / 100);
    const current = Number.isFinite(parseFloat(amount))
      ? Math.floor(parseFloat(amount))
      : 0;
    const next = Math.min(current + increment, totalInt);
    setAmount(String(next));
  };

  const handleMaxAmount = () => {
    const total = 10000; // Default balance for now
    setAmount(String(Math.floor(total)));
  };

  const handlePrediction = async () => {
    if (!prediction || !selectedTeam || !amount) {
      toast.error("Please select a team and enter an amount");
      return;
    }

    try {
      const side = selectedTeam === prediction.side1 ? "side1" : "side2";
      await makePrediction(side, parseFloat(amount));
      toast.success("Prediction placed successfully!");
      refreshBalances();
    } catch (error) {
      console.error("Prediction failed:", error);
    }
  };

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

  const getSidePercentage = (sideAmount: number, totalAmount: number) => {
    if (totalAmount === 0) return 50;
    return Math.round((sideAmount / totalAmount) * 100);
  };

  const payout =
    selectedTeam === prediction?.side1
      ? prediction
        ? (parseFloat(amount) * 1.5).toFixed(0)
        : "0"
      : prediction
      ? (parseFloat(amount) * 1.5).toFixed(0)
      : "0";

  if (loading || predictionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] via-[#16213e] to-[#0a0a0f]">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] via-[#16213e] to-[#0a0a0f]">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
          <div className="text-xl mb-4">Please sign in to view this page.</div>
          <div className="text-sm text-white/60">
            You need to be authenticated to access prediction pages.
          </div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] via-[#16213e] to-[#0a0a0f]">
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
          <div className="text-xl mb-4 text-red-400">
            Error loading prediction
          </div>
          <div className="text-sm text-white/60">
            {error || "Prediction not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] via-[#16213e] to-[#0a0a0f] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex flex-col gap-6 relative">
            <label className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 text-sm bg-green-500/90 text-black px-2 py-1 rounded-lg text-center">
              Wager Window Closing: {formatTimeLeft(prediction.wagerEndTime)}
            </label>
            {prediction.imageUrl ? (
              <Image
                src={`${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
                }/api${prediction.imageUrl}`}
                alt={prediction.name}
                width={420}
                height={420}
                className="w-[640px] h-[480px]"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center rounded-xl">
                <span className="text-white/60 text-lg font-medium">
                  No Image
                </span>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Prediction Trends</h3>
              <div className="">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                  <span className="text-sm">{prediction.side1}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${getSidePercentage(
                          prediction.side1Amount,
                          prediction.side1Amount + prediction.side2Amount
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {getSidePercentage(
                      prediction.side1Amount,
                      prediction.side1Amount + prediction.side2Amount
                    )}
                    %
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">{prediction.side2}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${getSidePercentage(
                          prediction.side2Amount,
                          prediction.side1Amount + prediction.side2Amount
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {getSidePercentage(
                      prediction.side2Amount,
                      prediction.side1Amount + prediction.side2Amount
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-2">
                <span>1H</span>
                <span>6H</span>
                <span>1D</span>
                <span>1W</span>
                <span>ALL</span>
              </div>
            </div>
          </div>

          <div className="">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-medium mb-2">{prediction.name}</h1>
                <p className="text-white/60 text-lg">{prediction.category}</p>
                {prediction.description && (
                  <p className="text-white/60 text-sm mt-2">
                    {prediction.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/90 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pool:{" "}
                {getTotalPool(prediction.side1Amount, prediction.side2Amount)}
              </div>
            </div>
            <div className="flex gap-5 pt-6">
              <div className="flex flex-col gap-5">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col gap-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedTeam(prediction.side1)}
                      className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                        selectedTeam === prediction.side1
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {prediction.side1}
                    </Button>
                    <Button
                      onClick={() => setSelectedTeam(prediction.side2)}
                      className={`flex-1 py-3 rounded-xl transition-all duration-300 ${
                        selectedTeam === prediction.side2
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {prediction.side2}
                    </Button>
                  </div>

                  <div className="bg-white/10 rounded-lg flex flex-col">
                    <label className="pt-2 px-2 font-semibold">Amount</label>
                    <Input
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Enter amount"
                      className="md:text-[24px] font-bold text-end px-2 bg-transparent border-none focus:ring-0 focus:ring-offset-0"
                    />
                    <div className="flex gap-2 p-2">
                      <Button
                        onClick={() => handlePercentageAdd(1)}
                        className="bg-white/10 hover:bg-white/20 text-white h-6 rounded-lg"
                      >
                        +1%
                      </Button>
                      <Button
                        onClick={() => handlePercentageAdd(2)}
                        className="bg-white/10 hover:bg-white/20 text-white h-6 rounded-lg"
                      >
                        +2%
                      </Button>
                      <Button
                        onClick={() => handlePercentageAdd(10)}
                        className="bg-white/10 hover:bg-white/20 text-white h-6 rounded-lg"
                      >
                        +10%
                      </Button>
                      <Button
                        onClick={handleMaxAmount}
                        className="bg-white/10 hover:bg-white/20 text-white h-6 rounded-lg"
                      >
                        MAX
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <Button
                      onClick={handlePrediction}
                      disabled={submitting || !selectedTeam || !amount}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Placing Prediction..." : "Predict"}
                    </Button>
                    <label className="text-xs text-white/60 text-center">
                      By predicting you agree to Terms of Use
                    </label>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <Target className="w-4 h-4" />
                    <span className="font-semibold">
                      Payout if {selectedTeam}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-400 mt-2">
                    {payout} $VS
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                  <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Last Trades</h3>
                  <div className="">
                    {predictionData.lastTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      >
                        <Image
                          src={trade.image}
                          alt="Match"
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {trade.user}
                          </div>
                          <div className="text-xs text-white/60">
                            {trade.team}
                          </div>
                        </div>
                        <div className="text-xs text-white/60">
                          {trade.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-5">
                {" "}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    WagerVS AI Insight
                  </h3>
                  <p className="text-white/70 mb-4 text-sm leading-relaxed">
                    {predictionData.aiInsight.summary}
                  </p>
                  <div className="">
                    <div className="text-sm font-semibold text-white/90">
                      Why?
                    </div>
                    {predictionData.aiInsight.reasons.map((reason, index) => (
                      <div
                        key={index}
                        className="text-sm text-white/70 leading-relaxed"
                      >
                        • {reason}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-cyan-400 pt-4">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      AI Confidence Level: {predictionData.aiInsight.confidence}
                      %
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Comments</h3>
                    <Button
                      onClick={() => setShowComments(!showComments)}
                      className="text-white/60 hover:text-white"
                      variant="ghost"
                      size="sm"
                    >
                      {showComments ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {showComments && (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-3">
                        {predictionData.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-center gap-3"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                              {comment.user.charAt(1).toUpperCase()}
                            </div>
                            <div className="">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {comment.user}
                                </span>
                                <span className="text-xs text-white/60">
                                  {comment.time}
                                </span>
                              </div>
                              <p className="text-sm text-white/80">
                                {comment.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        />
                        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
