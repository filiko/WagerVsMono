import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type StoreItem = {
  id: string;
  title: string;
  description: string;
  cost: number | "FREE";
  currency: "CHIPS" | "VS" | "POINTS" | "FREE";
  levelRequired: number;
  image: string;
  tag?: string;
  onPurchase?: () => void;
};

const currencyLabel = (currency: StoreItem["currency"]) => {
  if (currency === "FREE") return "FREE";
  if (currency === "CHIPS") return "Chips";
  if (currency === "VS") return "$VS";
  if (currency === "POINTS") return "Points";
  return currency;
};

const StoreItemCard: React.FC<{
  item: StoreItem;
  isLocked: boolean;
  userLevel: number;
}> = ({ item, isLocked, userLevel }) => {
  return (
    <motion.div
      whileHover={{ scale: isLocked ? 1.0 : 1.02 }}
      className={`relative rounded-2xl p-4 border bg-white/5 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden`}
    >
      {/* glow background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -inset-16 bg-gradient-to-br from-fuchsia-500/20 via-cyan-400/10 to-transparent blur-3xl" />
      </div>

      {/* lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-20 flex-col text-center p-4">
          <div className="text-lg font-semibold text-white mb-1">
            Locked 🔒
          </div>
          <div className="text-xs text-white/60 leading-snug">
            Requires Level {item.levelRequired}.  
            You are Level {userLevel}.
          </div>
        </div>
      )}

      {/* Tag / badge */}
      {item.tag && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[10px] uppercase tracking-wide bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-bold px-2 py-1 rounded-md shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {item.tag}
          </span>
        </div>
      )}

      {/* Image preview */}
      <div className="relative w-full aspect-[4/3] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
        {item.image && (
          <Image
            src={item.image}
            alt={item.title}
            width={200}
            height={150}
            className="w-full h-full object-contain opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Text */}
      <div className="mt-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold text-white leading-tight">
            {item.title}
          </div>
          <div className="text-[10px] text-white/40 font-medium px-2 py-1 rounded-lg bg-white/5 border border-white/10 whitespace-nowrap">
            Lvl {item.levelRequired}+
          </div>
        </div>

        <div className="text-[11px] text-white/50 leading-normal mt-1 line-clamp-3">
          {item.description}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          {/* Cost */}
          <div className="flex flex-col">
            <span className="text-white text-sm font-semibold leading-none">
              {item.cost === "FREE" ? "FREE" : item.cost}
              {item.cost === "FREE" ? "" : " "}
              {item.cost === "FREE" ? "" : currencyLabel(item.currency)}
            </span>
            <span className="text-[10px] text-white/40 leading-none">
              {item.currency === "POINTS"
                ? "Cycle Points"
                : currencyLabel(item.currency)}
            </span>
          </div>

          {/* CTA */}
          <button
            disabled={isLocked}
            onClick={() => !isLocked && item.onPurchase?.()}
            className={`text-[11px] font-semibold rounded-lg px-3 py-2 border transition
              ${
                isLocked
                  ? "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black border-transparent shadow-[0_0_20px_rgba(168,85,247,0.6)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)]"
              }`}
          >
            {item.cost === "FREE" ? "Claim" : "Buy"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreItemCard;