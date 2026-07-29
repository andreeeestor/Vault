import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Deleta arquivos temporários expirados
    const expiredResult = await db.item.deleteMany({
      where: {
        expiresAt: { lte: now },
        isDeleted: false,
      },
    });

    // 2. Purga lixeira com mais de 30 dias
    const trashCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const trashResult = await db.item.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: trashCutoff },
      },
    });

    return NextResponse.json({
      message: "Limpeza concluída",
      expiredDeleted: expiredResult.count,
      trashPurged: trashResult.count,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("Erro na cron de limpeza:", err);
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
