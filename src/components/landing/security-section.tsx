import { Lock, KeyRound, ShieldCheck, EyeOff } from "lucide-react";

const POINTS = [
  {
    icon: Lock,
    title: "AES-256-GCM",
    description: "O mesmo padrão de criptografia usado por bancos e governos para proteger suas senhas.",
  },
  {
    icon: KeyRound,
    title: "Senha mestra separada",
    description: "Sua senha de login nunca dá acesso ao cofre de senhas — só a senha mestra deriva a chave.",
  },
  {
    icon: EyeOff,
    title: "Zero-knowledge no trânsito",
    description: "Senhas decifradas só existem na memória da sua sessão — nunca ficam salvas em texto puro.",
  },
  {
    icon: ShieldCheck,
    title: "PBKDF2, 120 mil iterações",
    description: "A derivação de chave segue as recomendações atuais da OWASP contra ataques de força bruta.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="px-6 py-24 lg:px-10" style={{ background: "var(--background-elevated)" }}>
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            Segurança em primeiro lugar
          </span>
          <h2 className="text-display mt-3 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
            Suas senhas merecem mais do que uma planilha
          </h2>
          <p className="text-body mt-3 text-[var(--foreground-muted)]">
            Diferente de anotar senhas numa nota qualquer, o Vault cifra cada credencial
            individualmente e só a revela com sua senha mestra — que nem nós conseguimos recuperar.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" strokeWidth={1.75} />
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
                  <p className="text-body mt-0.5 text-sm text-[var(--foreground-muted)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)]">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--foreground-subtle)]">
            <Lock className="h-3.5 w-3.5" /> vault.encryptSecret()
          </div>
          <pre className="mt-3 overflow-x-auto rounded-[var(--radius-md)] bg-[#0C0A0F] p-4 text-xs leading-relaxed text-violet-200">
            <code>{`const key = pbkdf2(masterPassword, salt, 120_000)
const { ciphertext, iv, authTag } =
  aes256gcm.encrypt(password, key)

// Persistido: apenas o ciphertext.
// A chave nunca é salva — só derivada em memória.`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
