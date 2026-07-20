import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SecurityForm } from "./security-form";

export default async function SecuritySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      vaultMasterKeyHash: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const hasMasterPassword = !!user.vaultMasterKeyHash;

  return <SecurityForm hasMasterPassword={hasMasterPassword} />;
}
