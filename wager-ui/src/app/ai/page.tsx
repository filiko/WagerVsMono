"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  ChevronRight,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import Image from "next/image";

interface WagerAIResponse {
  message: string;
  type: "response" | "suggestion" | "analysis";
  confidence?: number;
  wagerId?: string;
  timestamp: string;
}

interface PoolData {
  id: string;
  title: string;
  category: string;
  aiConfidence: number;
  crowdSplit: number;
  lockTime: string;
  volume: number;
}

export default function WagerAIPage() {
  const [messages, setMessages] = useState<WagerAIResponse[]>([
    {
      message: "Hey! I'm WagerAI, your prediction intelligence assistant. I can analyze active pools, provide market insights, and help you make smarter wagers. What would you like to know?",
      type: "response",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLevel] = useState(2); // Mock user level - would come from auth
  const [topPools, setTopPools] = useState<PoolData[]>([]);

  // Mock top moving pools data
  useEffect(() => {
    setTopPools([
      {
        id: "1",
        title: "LeBron scores 25+ points vs Warriors",
        category: "NBA",
        aiConfidence: 78,
        crowdSplit: 65,
        lockTime: "2h 15m",
        volume: 12500
      },
      {
        id: "2", 
        title: "SOL reaches $200 by end of week",
        category: "Crypto",
        aiConfidence: 45,
        crowdSplit: 30,
        lockTime: "5d 12h",
        volume: 8900
      },
      {
        id: "3",
        title: "Real Madrid beats Barcelona",
        category: "Soccer",
        aiConfidence: 62,
        crowdSplit: 55,
        lockTime: "1d 8h",
        volume: 15600
      }
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: WagerAIResponse = {
      message: input,
      type: "response",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        {
          message: "Based on current market data, I'm seeing strong momentum in the NBA category. LeBron's recent form suggests a high probability of hitting 25+ points, especially against the Warriors' defense.",
          type: "analysis" as const,
          confidence: 78,
          timestamp: new Date().toISOString()
        },
        {
          message: "Here are the top 3 opportunities I'm tracking right now:",
          type: "suggestion" as const,
          timestamp: new Date().toISOString()
        }
      ];

      setMessages(prev => [...prev, ...responses]);
      setIsLoading(false);
    }, 1500);
  };

  const getLevelPerks = (level: number) => {
    const perks = {
      1: ["Basic summaries", "Pool recommendations"],
      2: ["Numeric confidence", "Crowd split data", "Create wagers"],
      3: ["Time windows", "Volatility labels", "Pro insights"],
      4: ["Full insider data", "Historical patterns", "Trap detection"]
    };
    return perks[level as keyof typeof perks] || [];
  };

  const getLevelName = (level: number) => {
    const names = {
      1: "Contender",
      2: "Creator", 
      3: "Strategist",
      4: "Elite"
    };
    return names[level as keyof typeof names] || "Contender";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a2e]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">WagerAI</h1>
                  <p className="text-white/60 text-sm">Your prediction intelligence assistant</p>
                </div>
                <Badge variant="outline" className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Level {userLevel} - {getLevelName(userLevel)}
                </Badge>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: message.type === "response" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${message.type === "response" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "response" 
                        ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" 
                        : "bg-white/5 border border-white/10"
                    }`}>
                      <p className="text-sm">{message.message}</p>
                      {message.confidence && (
                        <div className="flex items-center gap-2 mt-2">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs opacity-75">
                            AI Confidence: {message.confidence}%
                          </span>
                        </div>
                      )}
                      <p className="text-xs opacity-50 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                        <span className="text-sm text-white/60 ml-2">WagerAI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask WagerAI about pools, market trends, or get predictions..."
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Perks */}
            <Card className="bg-[#1a1a2e]/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Level {userLevel} Perks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {getLevelPerks(userLevel).map((perk, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                    <span className="text-white/80">{perk}</span>
                  </div>
                ))}
                {userLevel < 4 && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs text-white/60">
                      Unlock more features at Level {userLevel + 1}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Moving Pools */}
            <Card className="bg-[#1a1a2e]/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Moving Pools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topPools.map((pool) => (
                  <motion.div
                    key={pool.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white line-clamp-2">
                        {pool.title}
                      </h4>
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {pool.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>AI: {pool.aiConfidence}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Crowd: {pool.crowdSplit}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Clock className="w-3 h-3" />
                        <span>{pool.lockTime}</span>
                      </div>
                      <div className="text-xs text-white/60">
                        ${pool.volume.toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-[#1a1a2e]/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setInput("Show me the best NBA predictions today")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Best NBA Picks
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setInput("What crypto pools are trending?")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Crypto Trends
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-white/5 border-white/10 text-white hover:bg-white/10"
                  onClick={() => setInput("Create a wager about...")}
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Create Wager
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
