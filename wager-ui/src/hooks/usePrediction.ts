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

export const usePrediction = (id: string) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPrediction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/api/wagers/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Prediction not found");
        }
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      console.error("Error fetching prediction:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch prediction"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const makePrediction = useCallback(
    async (side: "side1" | "side2", amount: number) => {
      try {
        setSubmitting(true);
        setError(null);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/wagers/${id}/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            side,
            amount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to make prediction");
        }

        const data = await response.json();

        if (prediction) {
          setPrediction({
            ...prediction,
            side1Amount: data.wager.side1Amount,
            side2Amount: data.wager.side2Amount,
          });
        }

        return data;
      } catch (err) {
        console.error("Error making prediction:", err);
        setError(
          err instanceof Error ? err.message : "Failed to make prediction"
        );
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [id, prediction]
  );

  useEffect(() => {
    if (id) {
      fetchPrediction();
    }
  }, [fetchPrediction, id]);

  return {
    prediction,
    loading,
    error,
    submitting,
    makePrediction,
    refreshPrediction: fetchPrediction,
  };
};
