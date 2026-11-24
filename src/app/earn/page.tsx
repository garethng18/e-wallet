"use client";

import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
import { formatPoints } from "@/lib/utils";

const tasks = [
  {
    id: "walk" as const,
    title: "步行一万步",
    desc: "完成今日步行目标",
    amount: 120,
  },
  {
    id: "checkup" as const,
    title: "年度体检打卡",
    desc: "上传体检完成证明",
    amount: 300,
  },
  {
    id: "quiz" as const,
    title: "健康知识小测验",
    desc: "答对指定题目即可",
    amount: 80,
  },
];

const rewards = [
  {
    id: "coffee" as const,
    title: "咖啡礼券",
    amount: 200,
  },
  {
    id: "voucher" as const,
    title: "超市礼券",
    amount: 500,
  },
  {
    id: "wellness" as const,
    title: "健康体验礼遇",
    amount: 800,
  },
];

export default function EarnPage() {
  const { user, setUser, refresh } = useWallet();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function runEarn(taskId: (typeof tasks)[number]["id"]) {
    setPending(taskId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Earn failed");
      setUser(data.user);
      setMessage(`已赚取 ${formatPoints(data.transaction.amount)} 积分`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Earn failed");
    } finally {
      setPending(null);
    }
  }

  async function runRedeem(rewardId: (typeof rewards)[number]["id"]) {
    setPending(rewardId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Redeem failed");
      setUser(data.user);
      setMessage(`已兑换，扣减 ${formatPoints(data.transaction.amount)} 积分`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redeem failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <AuthGate>
      <main className="flex flex-1 flex-col px-5 pb-4 pt-10">
        <h1 className="font-display text-3xl text-[var(--ink)]">奖励中心</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          参考 AIA友Point：于任务中心赚取，于礼品平台兑换。
        </p>
        {user ? (
          <p className="mt-3 text-sm font-semibold text-[var(--brand)]">
            目前余额 {formatPoints(user.balance)}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            赚取积分
          </h2>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white p-4"
            >
              <div>
                <p className="font-semibold text-[var(--ink)]">{task.title}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{task.desc}</p>
                <p className="mt-2 text-sm font-medium text-[var(--brand)]">
                  +{task.amount}
                </p>
              </div>
              <Button
                size="sm"
                disabled={pending === task.id}
                onClick={() => void runEarn(task.id)}
              >
                {pending === task.id ? "…" : "开始"}
              </Button>
            </div>
          ))}
        </section>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            兑换奖励
          </h2>
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white p-4"
            >
              <div>
                <p className="font-semibold text-[var(--ink)]">{reward.title}</p>
                <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">
                  {reward.amount} 积分
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={pending === reward.id}
                onClick={() => void runRedeem(reward.id)}
              >
                {pending === reward.id ? "…" : "兑换"}
              </Button>
            </div>
          ))}
        </section>
      </main>
    </AuthGate>
  );
}
