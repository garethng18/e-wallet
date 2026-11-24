"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Home, Send, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/wallet", label: "钱包", icon: Home },
  { href: "/earn", label: "赚取", icon: Gift },
  { href: "/transfer", label: "转赠", icon: Send },
  { href: "/history", label: "记录", icon: ScrollText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-[var(--line)] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <ul className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition",
                  active
                    ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
