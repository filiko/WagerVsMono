"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Star, 
  Zap, 
  Target, 
  TrendingUp, 
  Crown,
  Lock,
  Check,
  Sparkles,
  Coins,
  Gift
} from "lucide-react";
import Image from "next/image";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "chips" | "points" | "vs";
  category: "chips" | "ai" | "creator" | "pro" | "elite";
  levelRequired: number;
  icon: string;
  features: string[];
  popular?: boolean;
  new?: boolean;
}

const storeItems: StoreItem[] = [
  // Chip Bundles
  {
    id: "chips-1000",
    name: "Starter Pack",
    description: "Perfect for new players",
    price: 1000,
    currency: "vs",
    category: "chips",
    levelRequired: 1,
    icon: "🪙",
    features: ["1000 VS Chips", "Beginner friendly", "Instant delivery"],
    popular: true
  },
  {
    id: "chips-5000",
    name: "Player Pack",
    description: "For regular wagers",
    price: 5000,
    currency: "vs",
    category: "chips",
    levelRequired: 1,
    icon: "💰",
    features: ["5000 VS Chips", "10% bonus", "Instant delivery"]
  },
  {
    id: "chips-10000",
    name: "Pro Pack",
    description: "For serious players",
    price: 10000,
    currency: "vs",
    category: "chips",
    levelRequired: 2,
    icon: "💎",
    features: ["10000 VS Chips", "20% bonus", "Priority support"],
    new: true
  },

  // AI Enhancements
  {
    id: "ai-reasoning",
    name: "AI Reasoning Boost",
    description: "Enhanced AI analysis for 24 hours",
    price: 500,
    currency: "chips",
    category: "ai",
    levelRequired: 2,
    icon: "🧠",
    features: ["Deeper AI insights", "24-hour duration", "All categories"]
  },
  {
    id: "ai-trends",
    name: "Trend Analysis Pack",
    description: "Advanced market trend data",
    price: 1000,
    currency: "chips",
    category: "ai",
    levelRequired: 3,
    icon: "📊",
    features: ["Market trends", "Historical data", "7-day access"]
  },

  // Creator Tools
  {
    id: "creator-credits",
    name: "Wager Credits",
    description: "Create 5 custom wagers",
    price: 150,
    currency: "chips",
    category: "creator",
    levelRequired: 2,
    icon: "🎯",
    features: ["5 wager credits", "Custom categories", "Set your fees"]
  },
  {
    id: "creator-boost",
    name: "Visibility Boost",
    description: "Featured placement for 24 hours",
    price: 300,
    currency: "chips",
    category: "creator",
    levelRequired: 2,
    icon: "🚀",
    features: ["Featured placement", "24-hour duration", "Higher visibility"]
  },

  // Pro Insights
  {
    id: "pro-analytics",
    name: "Pro Analytics",
    description: "Advanced performance tracking",
    price: 2000,
    currency: "chips",
    category: "pro",
    levelRequired: 3,
    icon: "📈",
    features: ["Performance metrics", "Win rate tracking", "ROI analysis"]
  },
  {
    id: "pro-dashboard",
    name: "Pro Dashboard",
    description: "Comprehensive market overview",
    price: 1500,
    currency: "chips",
    category: "pro",
    levelRequired: 3,
    icon: "🎛️",
    features: ["Market overview", "Real-time data", "Custom alerts"]
  },

  // Elite Exclusive
  {
    id: "elite-insights",
    name: "Elite Intelligence",
    description: "Full insider data access",
    price: 5000,
    currency: "chips",
    category: "elite",
    levelRequired: 4,
    icon: "👑",
    features: ["Insider data", "Historical patterns", "Trap detection"],
    popular: true
  },
  {
    id: "elite-nft",
    name: "Elite NFT Badge",
    description: "Exclusive collectible badge",
    price: 10000,
    currency: "chips",
    category: "elite",
    levelRequired: 4,
    icon: "🏆",
    features: ["Unique NFT", "Elite status", "Special privileges"]
  }
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userLevel] = useState(2); // Mock user level
  const [userChips] = useState(2500); // Mock user chips
  const [userPoints] = useState(150); // Mock user points

  const categories = [
    { id: "all", name: "All Items", icon: ShoppingBag },
    { id: "chips", name: "Chip Bundles", icon: Coins },
    { id: "ai", name: "AI Enhancements", icon: Sparkles },
    { id: "creator", name: "Creator Tools", icon: Target },
    { id: "pro", name: "Pro Insights", icon: TrendingUp },
    { id: "elite", name: "Elite Exclusive", icon: Crown }
  ];

  const filteredItems = selectedCategory === "all" 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory);

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case "chips": return "🪙";
      case "points": return "⭐";
      case "vs": return "💎";
      default: return "💰";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      chips: "from-yellow-500 to-orange-500",
      ai: "from-purple-500 to-pink-500",
      creator: "from-blue-500 to-cyan-500",
      pro: "from-green-500 to-emerald-500",
      elite: "from-red-500 to-pink-500"
    };
    return colors[category as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const canAfford = (item: StoreItem) => {
    switch (item.currency) {
      case "chips": return userChips >= item.price;
      case "points": return userPoints >= item.price;
      case "vs": return true; // VS tokens handled separately
      default: return false;
    }
  };

  const handlePurchase = (item: StoreItem) => {
    // Mock purchase logic
    console.log(`Purchasing ${item.name} for ${item.price} ${item.currency}`);
    // In production, this would call the backend API
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              WagerVS Store
            </h1>
          </div>
          <p className="text-white/60 text-lg">
            Enhance your prediction experience with premium tools and upgrades
          </p>
        </motion.div>

        {/* User Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-[#1a1a2e]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">VS Chips</p>
                  <p className="text-xl font-bold text-white">{userChips.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e]/50 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Points</p>
                  <p className="text-xl font-bold text-white">{userPoints.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a2e]/50 border-white/10">
            <CardContent className="p-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Level</p>
                  <p className="text-xl font-bold text-white">{userLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </motion.div>

        {/* Store Items Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <Card className={`bg-[#1a1a2e]/50 border-white/10 h-full ${
                item.levelRequired > userLevel ? "opacity-60" : ""
              }`}>
                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {item.popular && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                      Popular
                    </Badge>
                  )}
                  {item.new && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      New
                    </Badge>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getCategoryColor(item.category)} rounded-full flex items-center justify-center text-2xl`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">{item.name}</CardTitle>
                      <p className="text-white/60 text-sm">{item.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Level Requirement */}
                  {item.levelRequired > userLevel && (
                    <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-md p-2">
                      <Lock className="w-4 h-4" />
                      <span>Requires Level {item.levelRequired}</span>
                    </div>
                  )}

                  {/* Price and Purchase */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCurrencyIcon(item.currency)}</span>
                      <span className="text-xl font-bold text-white">
                        {item.price.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={item.levelRequired > userLevel || !canAfford(item)}
                      className={`${
                        item.levelRequired > userLevel
                          ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                          : canAfford(item)
                          ? "bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600"
                          : "bg-red-500/50 text-red-300 cursor-not-allowed"
                      }`}
                    >
                      {item.levelRequired > userLevel ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </>
                      ) : !canAfford(item) ? (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Need More
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
