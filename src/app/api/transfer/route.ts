import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getStoreMode, transferPoints } from "@/lib/wallet-store";

const bodySchema = z.object({
  toUsername: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const body = bodySchema.parse(json);
    const result = await transferPoints({
      fromUserId: session.userId,
      toUsername: body.toUsername,
      amount: body.amount,
      note: body.note,
    });
    return NextResponse.json({ ...result, mode: getStoreMode() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Transfer failed";
    const status =
      message.includes("Insufficient") ||
      message.includes("not found") ||
      message.includes("yourself") ||
      message.includes("positive")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
