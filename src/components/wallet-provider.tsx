"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PublicUser } from "@/lib/types";

type WalletContextValue = {
  user: PublicUser | null;
  mode: "google-sheets" | "sample-data" | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setUser: (user: PublicUser | null) => void;
  setMode: (mode: "google-sheets" | "sample-data" | null) => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [mode, setMode] = useState<"google-sheets" | "sample-data" | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me");
      if (res.status === 401) {
        setUser(null);
        setMode(null);
        return;
      }
      if (!res.ok) {
        throw new Error("Unable to load wallet");
      }
      const data = await res.json();
      setUser(data.user);
      setMode(data.mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <WalletContext.Provider
      value={{ user, mode, loading, error, refresh, setUser, setMode }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
