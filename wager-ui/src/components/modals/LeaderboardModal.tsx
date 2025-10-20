"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import { leaderboardData, LeaderboardEntry } from "@/constants/leaderboardData";

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaderboardModal({
  open,
  onOpenChange,
}: LeaderboardModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-black";
    if (rank === 2) return "bg-gray-400 text-black";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-gray-600 text-white";
  };

  const getRowBackgroundColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser)
      return "bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-400/30 hover:from-purple-500/30 hover:to-purple-600/30 hover:border-purple-400/50";
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30 hover:from-yellow-500/30 hover:to-yellow-600/30 hover:border-yellow-400/50";
    if (rank === 2)
      return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-300/30 hover:from-gray-400/30 hover:to-gray-500/30 hover:border-gray-300/50";
    if (rank === 3)
      return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-500/30 hover:from-amber-600/30 hover:to-amber-700/30 hover:border-amber-500/50";
    return "bg-white/5 border-white/10 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/30";
  };

  const filteredData = leaderboardData.filter((entry) =>
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-cyan-400/30 text-white max-w-4xl max-h-[90vh] overflow-hidden p-0 overflow-x-hidden">
        <DialogHeader className="text-center p-6 pb-0">
          <div className="flex flex-col items-center gap-3">
            <Image
              src="/icon/cup.svg"
              alt="Trophy"
              width={100}
              height={100}
              className="w-[100px] h-[100px]"
            />
            <DialogTitle className="text-[18px] font-light">
              Leaderboard
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6 pt-4">
          {/* Search and Controls */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Select
              value={entriesPerPage.toString()}
              onValueChange={(value) => setEntriesPerPage(Number(value))}
            >
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border-white/10">
                <SelectItem value="5" className="text-white">
                  5
                </SelectItem>
                <SelectItem value="10" className="text-white">
                  10
                </SelectItem>
                <SelectItem value="20" className="text-white">
                  20
                </SelectItem>
                <SelectItem value="50" className="text-white">
                  50
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leaderboard Entries */}
          <div className="space-y-2 max-h-96 overflow-y-auto leaderboard-scroll">
            {currentData.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ease-in-out cursor-pointer  hover:shadow-lg hover:shadow-cyan-500/10 ${getRowBackgroundColor(
                  entry.rank,
                  entry.isCurrentUser || false
                )}`}
              >
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(
                    entry.rank
                  )}`}
                >
                  {entry.rank}
                </div>

                {/* Avatar */}
                <Avatar className="w-12 h-12">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">
                    {entry.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold truncate ${
                        entry.isCurrentUser ? "text-purple-300" : "text-white"
                      }`}
                    >
                      {entry.name}
                    </h3>
                    {entry.isCurrentUser && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">{entry.points} pts</p>
                </div>

                {/* Prize */}
                <div className="text-right">
                  <p className="font-bold text-cyan-400">{entry.prize}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="text-sm text-white/60">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)}{" "}
              of {filteredData.length} entries
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={
                        currentPage === page
                          ? "bg-cyan-500 text-black hover:bg-cyan-600"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-white/40">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
