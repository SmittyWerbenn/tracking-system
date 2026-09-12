import { createContext, useContext, type ReactNode } from "react";
import type { Feedback } from "../types";
import { initialFeedback } from "../data/masterData";
import { usePersistedState } from "../utils/usePersistedState";

const STORAGE_KEY = "gms-feedback-v1";

export interface AddFeedbackInput {
  awb: string;
  customerName: string;
  rating: number;
  comment?: string;
}

interface FeedbackContextValue {
  feedback: Feedback[];
  addFeedback: (input: AddFeedbackInput) => void;
  hasFeedback: (awb: string) => boolean;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = usePersistedState<Feedback[]>(STORAGE_KEY, initialFeedback);

  function addFeedback(input: AddFeedbackInput) {
    const entry: Feedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      submittedAt: new Date().toISOString(),
      ...input,
    };
    setFeedback((prev) => [entry, ...prev]);
  }

  function hasFeedback(awb: string) {
    return feedback.some((f) => f.awb === awb);
  }

  return (
    <FeedbackContext.Provider value={{ feedback, addFeedback, hasFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}
