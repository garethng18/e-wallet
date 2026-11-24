import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listDirectory } from "@/lib/wallet-store";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listDirectory(session.userId);
  return NextResponse.json({ users });
}
