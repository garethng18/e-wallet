import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getStoreMode, redeemPoints } from "@/lib/wallet-store";

const REWARDS: Record<string, { amount: number; note: string }> = {
  coffee: { amount: 200, note: "兑换咖啡礼券" },
  voucher: { amount: 500, note: "兑换超市礼券" },
  wellness: { amount: 800, note: "兑换健康体验礼遇" },
};

const bodySchema = z.object({
  rewardId: z.enum(["coffee", "voucher", "wellness"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { rewardId } = bodySchema.parse(json);
    const reward = REWARDS[rewardId];
    const result = await redeemPoints({
      userId: session.userId,
      amount: reward.amount,
      note: reward.note,
    });
    return NextResponse.json({ ...result, mode: getStoreMode() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Redeem failed";
    const status = message.includes("Insufficient") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
