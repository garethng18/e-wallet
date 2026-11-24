import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { earnPoints, getStoreMode } from "@/lib/wallet-store";

const TASKS: Record<string, { amount: number; note: string }> = {
  walk: { amount: 120, note: "完成健康任务：步行一万步" },
  checkup: { amount: 300, note: "完成健康任务：年度体检打卡" },
  quiz: { amount: 80, note: "完成健康知识小测验" },
};

const bodySchema = z.object({
  taskId: z.enum(["walk", "checkup", "quiz"]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { taskId } = bodySchema.parse(json);
    const task = TASKS[taskId];
    const result = await earnPoints({
      userId: session.userId,
      amount: task.amount,
      note: task.note,
    });
    return NextResponse.json({ ...result, mode: getStoreMode() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Earn failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
