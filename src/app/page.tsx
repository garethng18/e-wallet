"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PhoneShell } from "@/components/phone-shell";
import { LoginForm } from "@/components/login-form";
import { useWallet } from "@/components/wallet-provider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useWallet();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/wallet");
    }
  }, [loading, user, router]);

  return (
    <PhoneShell>
      <main className="flex flex-1 flex-col px-6 pb-8 pt-14">
        <div className="animate-rise mb-10 space-y-4">
          <p className="font-display text-4xl tracking-tight text-[var(--brand)]">
            E Wallet
          </p>
          <h1 className="max-w-[14ch] text-2xl font-semibold leading-snug text-[var(--ink)]">
            Fun享健康长久好生活
          </h1>
          <p className="max-w-[28ch] text-sm leading-relaxed text-[var(--ink-soft)]">
            参考 AIA友Point 体验：做任务赚积分、兑换奖励、转赠亲友。钱包资料同步至
            Google Sheet。
          </p>
        </div>

        <div className="animate-rise-delay mt-auto rounded-[1.5rem] border border-[var(--line)] bg-white/90 p-5 shadow-[0_18px_40px_rgba(80,20,30,0.08)]">
          {loading ? (
            <p className="py-8 text-center text-sm text-[var(--muted)]">
              正在检查登录状态…
            </p>
          ) : (
            <LoginForm />
          )}
        </div>
      </main>
    </PhoneShell>
  );
}
