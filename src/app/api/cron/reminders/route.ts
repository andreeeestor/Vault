import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { db } from "@/lib/db";
import { resend, EMAIL_FROM } from "@/lib/email";
import ReminderEmail from "@/emails/reminder";

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
    const reminders = await db.item.findMany({
      where: {
        type: "REMINDER",
        reminderAt: { lte: now },
        reminderSent: false,
        isDeleted: false,
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
    const failedIds: string[] = [];

    for (const item of reminders) {
      try {
        const itemWithUser = item as typeof item & {
          user: { email: string; name: string | null };
        };
        const userEmail = itemWithUser.user.email;
        const userName = itemWithUser.user.name ?? "Usuário";

        const html = await render(
          ReminderEmail({
            userName,
            reminderTitle: item.title,
            reminderDescription: item.noteContent,
            reminderAt: item.reminderAt ?? now,
            vaultUrl: `${process.env.NEXTAUTH_URL ?? "https://vault.app"}/vault`,
          })
        );

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || EMAIL_FROM,
          to: userEmail,
          subject: `⏰ Lembrete do Vault: ${item.title}`,
          html,
        });

        sentIds.push(item.id);
      } catch (err) {
        console.error(`Erro ao enviar lembrete ${item.id}:`, err);
        failedIds.push(item.id);
      }
    }

    if (sentIds.length > 0) {
      await db.item.updateMany({
        where: { id: { in: sentIds } },
        data: { reminderSent: true },
      });
    }

    return NextResponse.json({
      message: `${sentIds.length} lembrete(s) enviado(s)`,
      sentIds,
      failedIds,
    });
  } catch (err) {
    console.error("Erro na cron de lembretes:", err);
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
