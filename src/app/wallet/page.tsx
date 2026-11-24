"use client";

import { useRouter } from "next/navigation";
import { LogOut, QrCode, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
import { formatPoints } from "@/lib/utils";

export default function WalletPage() {
  const router = useRouter();
  const { user, mode, setUser, setMode, refresh } = useWallet();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMode(null);
    router.replace("/");
  }

  return (
    <AuthGate>
      {user ? (
        <main className="flex flex-1 flex-col px-5 pb-4 pt-10">
          <header className="mb-6 flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-3xl text-[var(--brand)]">
                E Wallet
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                你好，{user.displayName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              onClick={() => void logout()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </header>

          <section className="animate-rise relative overflow-hidden rounded-[1.75rem] bg-[linear-gradient(145deg,#c8102e_0%,#8f0f28_55%,#5c1a24_100%)] p-6 text-white shadow-[0_20px_50px_rgba(140,20,40,0.35)]">
            <div className="balance-sheen pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  AIA友Point 风格
                </span>
                <QrCode className="h-6 w-6 opacity-80" />
              </div>
              <p className="text-sm text-white/80">可用积分余额</p>
              <p className="animate-balance mt-2 font-display text-5xl tracking-tight">
                {formatPoints(user.balance)}
              </p>
              <div className="mt-8 flex items-end justify-between gap-3 text-sm">
                <div>
                  <p className="text-white/65">会员 ID</p>
                  <p className="mt-1 font-semibold tracking-wide">
                    {user.memberId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/65">用户名</p>
                  <p className="mt-1 font-semibold">{user.username}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-rise-delay mt-5 grid grid-cols-3 gap-3">
            {[
              { href: "/earn", label: "赚取积分", hint: "任务中心" },
              { href: "/transfer", label: "转赠积分", hint: "分享喜悦" },
              { href: "/history", label: "积分记录", hint: "交易明细" },
            ].map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className="rounded-2xl border border-[var(--line)] bg-white p-3 text-left transition hover:border-[var(--brand)] hover:shadow-sm active:scale-[0.98]"
              >
                <Sparkles className="mb-3 h-4 w-4 text-[var(--brand)]" />
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {item.label}
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  {item.hint}
                </p>
              </button>
            ))}
          </section>

          <section className="mt-5 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--mist)] px-4 py-3 text-xs leading-relaxed text-[var(--ink-soft)]">
            <p>
              数据来源：
              {mode === "google-sheets"
                ? "已连接 Google Sheet（实时读写）"
                : "Sample data（与 Google Sheet 结构一致；绑定服务账号后即同步）"}
            </p>
            <button
              type="button"
              className="mt-2 font-semibold text-[var(--brand)]"
              onClick={() => void refresh()}
            >
              刷新余额
            </button>
          </section>
        </main>
      ) : null}
    </AuthGate>
  );
}
