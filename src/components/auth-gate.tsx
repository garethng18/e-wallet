"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/components/wallet-provider";
import { PhoneShell } from "@/components/phone-shell";
import { BottomNav } from "@/components/bottom-nav";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, error } = useWallet();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <PhoneShell>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--muted)]">载入钱包中…</p>
        </div>
      </PhoneShell>
    );
  }

  if (!user) {
    return (
      <PhoneShell>
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--muted)]">正在跳转登录…</p>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <div className="flex flex-1 flex-col">
        {error ? (
          <p className="mx-4 mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {error}
          </p>
        ) : null}
        <div className="flex-1">{children}</div>
        <BottomNav />
      </div>
    </PhoneShell>
  );
}
