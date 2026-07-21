import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email";

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
    const reminders = await db.item.findMany({
      where: {
        type: "REMINDER",
        reminderAt: { lte: now },
        reminderSent: false,
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (reminders.length === 0) {
      return NextResponse.json({ message: "Nenhum lembrete para enviar" });
    }

    const sentIds: string[] = [];

    for (const item of reminders) {
      try {
        const userEmail = item.user.email;
        const userName = item.user.name ?? "Usuário";

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || EMAIL_FROM || "onboarding@resend.dev",
          to: userEmail,
          subject: `⏰ Lembrete do Vault: ${item.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;">
              <h2 style="color: #7c3aed; margin-top: 0;">Vault Lembretes</h2>
              <p>Olá, <strong>${userName}</strong>!</p>
              <p>Você tem um lembrete agendado:</p>
              <div style="padding: 16px; background: #f8fafc; border-left: 4px solid #7c3aed; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin: 0 0 8px 0; color: #1e293b;">${item.title}</h3>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">${item.noteContent || "Sem descrição"}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                Este é um email automático enviado pelo Vault.
              </p>
            </div>
          `,
        });

        sentIds.push(item.id);
      } catch (err) {
        console.error(`Erro ao enviar lembrete ${item.id} para email:`, err);
      }
    }

    if (sentIds.length > 0) {
      await db.item.updateMany({
        where: { id: { in: sentIds } },
        data: { reminderSent: true },
      });
    }

    return NextResponse.json({
      message: `Sucesso: ${sentIds.length} lembrete(s) enviado(s)`,
      sentIds,
    });
  } catch (err: any) {
    console.error("Erro na cron de lembretes:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
