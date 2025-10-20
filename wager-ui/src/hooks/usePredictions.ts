"use client";

import { useState, useEffect, useCallback } from "react";

interface Prediction {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  side1: string;
  side2: string;
  wagerEndTime: string;
  isPublic: boolean;
  winningSide: string | null;
  wagerStatus: string;
  side1Amount: number;
  side2Amount: number;
  createdAt: string;
  updatedAt: string;
  createdById: number;
}

export const usePredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(
    async (filters?: {
      status?: string;
      category?: string;
      isPublic?: boolean;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const queryParams = new URLSearchParams();

        if (filters?.status) queryParams.append("status", filters.status);
        if (filters?.category) queryParams.append("category", filters.category);
        if (filters?.isPublic !== undefined)
          queryParams.append("isPublic", filters.isPublic.toString());

        const response = await fetch(
          `${apiUrl}/api/wagers?${queryParams.toString()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch predictions");
        }

        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch predictions"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshPredictions = useCallback(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  useEffect(() => {
    fetchPredictions({ status: "active" });
  }, [fetchPredictions]);

  return {
    predictions,
    loading,
    error,
    refreshPredictions,
    fetchPredictions,
  };
};
