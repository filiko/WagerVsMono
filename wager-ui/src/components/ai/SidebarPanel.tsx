"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface SidebarPanelProps {
  level: number;
  experience: number;
  nextLevelExp: number;
  onLevelUp: () => void;
}

export function SidebarPanel({ level, experience, nextLevelExp, onLevelUp }: SidebarPanelProps) {
  const progressPercentage = (experience / nextLevelExp) * 100;

  const getLevelTitle = (level: number) => {
    if (level < 5) return "Rookie";
    if (level < 15) return "Analyst";
    if (level < 30) return "Strategist";
    if (level < 50) return "Expert";
    return "Master";
  };

  const getLevelColor = (level: number) => {
    if (level < 5) return "bg-gray-500";
    if (level < 15) return "bg-green-500";
    if (level < 30) return "bg-blue-500";
    if (level < 50) return "bg-purple-500";
    return "bg-yellow-500";
  };

  const insights = [
    {
      title: "Market Sentiment",
      value: "Bullish",
      change: "+12%",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Prediction Accuracy",
      value: "78%",
      change: "+5%",
      icon: Target,
      color: "text-blue-500",
    },
    {
      title: "AI Confidence",
      value: "High",
      change: "+3%",
      icon: Zap,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="w-80 bg-gradient-to-b from-[#1a1a2e] to-[#16182c] border-l border-white/10 p-6 space-y-6">
      {/* User Level Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-white">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>Your Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full ${getLevelColor(level)} flex items-center justify-center text-white font-bold text-lg`}>
                  {level}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{getLevelTitle(level)}</h3>
                  <p className="text-white/60 text-sm">Level {level}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/80">
                <span>Experience</span>
                <span>{experience}/{nextLevelExp}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights Cards */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-white font-semibold text-lg">Live Insights</h3>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center`}>
                      <insight.icon className={`w-4 h-4 ${insight.color}`} />
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">{insight.title}</p>
                      <p className="text-white font-semibold">{insight.value}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    {insight.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Tips */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-400/30">
          <CardContent className="p-4">
            <h4 className="text-white font-semibold mb-2">💡 AI Tip</h4>
            <p className="text-white/80 text-sm">
              {level < 10 
                ? "Start with lower-risk predictions to build your confidence and experience."
                : level < 25
                ? "Focus on diversifying your prediction portfolio across different categories."
                : "Use advanced analytics and market sentiment data to identify high-probability opportunities."
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
