"use client";

import { FormEvent, useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/components/wallet-provider";
import { formatPoints } from "@/lib/utils";

type DirectoryUser = {
  userId: string;
  username: string;
  displayName: string;
  memberId: string;
};

export default function TransferPage() {
  const { user, setUser, refresh } = useWallet();
  const [directory, setDirectory] = useState<DirectoryUser[]>([]);
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/directory");
      if (!res.ok) return;
      const data = await res.json();
      setDirectory(data.users ?? []);
      if (data.users?.[0]) setToUsername(data.users[0].username);
    })();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUsername,
          amount: Number(amount),
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      setUser(data.from);
      setMessage(
        `已转赠 ${formatPoints(data.transaction.amount)} 积分给 ${data.to.displayName}`,
      );
      setNote("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthGate>
      <main className="flex flex-1 flex-col px-5 pb-4 pt-10">
        <h1 className="font-display text-3xl text-[var(--ink)]">转赠积分</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          将 E Wallet 积分转赠予其他会员，一齐分享更多喜悦。
        </p>
        {user ? (
          <p className="mt-3 text-sm font-semibold text-[var(--brand)]">
            可转赠余额 {formatPoints(user.balance)}
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-5"
        >
          <div className="space-y-2">
            <Label htmlFor="toUsername">收款会员用户名</Label>
            <Input
              id="toUsername"
              list="member-directory"
              value={toUsername}
              onChange={(e) => setToUsername(e.target.value)}
              placeholder="mei"
              required
            />
            <datalist id="member-directory">
              {directory.map((item) => (
                <option key={item.userId} value={item.username}>
                  {item.displayName} · {item.memberId}
                </option>
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">转赠数量</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">备注（可选）</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="生日快乐！"
              maxLength={200}
            />
          </div>

          {message ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "提交中…" : "确认转赠"}
          </Button>
        </form>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            可转赠会员
          </h2>
          <ul className="space-y-2">
            {directory.map((item) => (
              <li key={item.userId}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-left transition hover:border-[var(--brand)]"
                  onClick={() => setToUsername(item.username)}
                >
                  <span>
                    <span className="block text-sm font-semibold">
                      {item.displayName}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      @{item.username}
                    </span>
                  </span>
                  <span className="text-xs text-[var(--ink-soft)]">
                    {item.memberId}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AuthGate>
  );
}
