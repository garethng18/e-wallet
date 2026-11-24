import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { findUserByUsername, getStoreMode } from "@/lib/wallet-store";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { username, password } = bodySchema.parse(json);
    const user = await findUserByUsername(username);

    if (!user || user.password !== password || user.status !== "active") {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    await createSession({ userId: user.userId, username: user.username });

    return NextResponse.json({
      ok: true,
      mode: getStoreMode(),
      user: {
        userId: user.userId,
        username: user.username,
        displayName: user.displayName,
        balance: user.balance,
        memberId: user.memberId,
        status: user.status,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
