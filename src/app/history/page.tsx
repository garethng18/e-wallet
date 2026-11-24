"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useWallet } from "@/components/wallet-provider";
import type { WalletTransaction } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

function typeLabel(type: WalletTransaction["type"]) {
  if (type === "earn") return "赚取";
  if (type === "redeem") return "兑换";
  return "转赠";
}

export default function HistoryPage() {
  const { user } = useWallet();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Load failed");
        setTransactions(data.transactions ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthGate>
      <main className="flex flex-1 flex-col px-5 pb-4 pt-10">
        <h1 className="font-display text-3xl text-[var(--ink)]">积分记录</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          查看已赚取、兑换与转赠的交易明细。
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-[var(--muted)]">载入记录中…</p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!loading && !error && transactions.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
            暂无交易记录
          </p>
        ) : null}

        <ul className="mt-6 space-y-3">
          {transactions.map((txn) => {
            const incoming = user ? txn.toUserId === user.userId : false;
            const signed =
              txn.type === "earn" || (txn.type === "transfer" && incoming)
                ? txn.amount
                : -txn.amount;
            return (
              <li
                key={txn.txnId}
                className="rounded-2xl border border-[var(--line)] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      {typeLabel(txn.type)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                      {txn.note}
                    </p>
                    <p className="mt-2 text-[11px] text-[var(--muted)]">
                      {new Date(txn.createdAt).toLocaleString("zh-HK", {
                        timeZone: "Asia/Taipei",
                      })}{" "}
                      · {txn.txnId}
                    </p>
                  </div>
                  <p
                    className={`text-base font-semibold ${
                      signed >= 0 ? "text-emerald-700" : "text-[var(--brand)]"
                    }`}
                  >
                    {signed >= 0 ? "+" : ""}
                    {formatPoints(signed)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </AuthGate>
  );
}
