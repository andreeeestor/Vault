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
    <section
      id="security"
      className="px-6 py-24 lg:px-10"
      style={{ background: "#EDE9F5" }}
    >
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#7C3AED]">
            Segurança em primeiro lugar
          </span>
          <h2 className="font-serif mt-3 text-4xl font-black leading-tight tracking-tight text-[#1E1B2E] sm:text-5xl">
            Suas senhas merecem mais do que uma planilha
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#1E1B2E]/55">
            Diferente de anotar senhas numa nota qualquer, o Vault cifra cada credencial
            individualmente e só a revela com sua senha mestra — que nem nós conseguimos recuperar.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 border-[#7C3AED]/30 bg-[#7C3AED]/10">
                  <Icon className="h-4 w-4 text-[#7C3AED]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1E1B2E]">{title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#1E1B2E]/55">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code block — neo-brutal style */}
        <div className="nb-shadow rounded-2xl border-2 border-[#1E1B2E] bg-[#0C0A0F] p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
            <Lock className="h-3.5 w-3.5" />
            <span>vault.encryptSecret()</span>
          </div>
          <pre className="mt-4 overflow-x-auto text-xs leading-relaxed text-violet-200">
            <code>{`const key = pbkdf2(masterPassword, salt, 120_000)
const { ciphertext, iv, authTag } =
  aes256gcm.encrypt(password, key)

// Persistido: apenas o ciphertext.
// A chave nunca é salva — só derivada em memória.`}</code>
          </pre>

          {/* Dots */}
          <div className="mt-5 flex items-center gap-1.5 border-t border-white/8 pt-4">
            <span className="h-2 w-2 rounded-full bg-red-500/70" />
            <span className="h-2 w-2 rounded-full bg-amber-500/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-[10px] text-white/30">src/lib/crypto.ts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
