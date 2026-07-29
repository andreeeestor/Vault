import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Preview,
  Section,
  Hr,
  Img,
} from "@react-email/components";

interface ReminderEmailProps {
  userName: string;
  reminderTitle: string;
  reminderDescription?: string | null;
  reminderAt: Date;
  vaultUrl?: string;
}

export default function ReminderEmail({
  userName,
  reminderTitle,
  reminderDescription,
  reminderAt,
  vaultUrl = "https://vault.app/vault",
}: ReminderEmailProps) {
  const formattedDate = reminderAt.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>⏰ Lembrete do Vault: {reminderTitle}</Preview>
      <Body
        style={{
          backgroundColor: "#F4EFE8",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <Section
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)",
              padding: "32px 40px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                fontSize: "28px",
                margin: "0 0 8px 0",
              }}
            >
              ⏰
            </Text>
            <Heading
              style={{
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: "700",
                margin: "0",
                letterSpacing: "-0.5px",
              }}
            >
              Vault Lembretes
            </Heading>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "14px",
                margin: "4px 0 0 0",
              }}
            >
              Você tem um lembrete agendado
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: "32px 40px" }}>
            <Text
              style={{
                color: "#6B6478",
                fontSize: "15px",
                margin: "0 0 24px 0",
                lineHeight: "1.6",
              }}
            >
              Olá, <strong style={{ color: "#1E1B2E" }}>{userName}</strong>! 👋
              <br />
              Este é um aviso do seu cofre Vault:
            </Text>

            {/* Reminder card */}
            <Section
              style={{
                backgroundColor: "#FAF5FF",
                border: "1px solid #E9D5FF",
                borderLeft: "4px solid #7C3AED",
                borderRadius: "10px",
                padding: "20px 24px",
                margin: "0 0 24px 0",
              }}
            >
              <Heading
                as="h2"
                style={{
                  color: "#1E1B2E",
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                }}
              >
                {reminderTitle}
              </Heading>

              {reminderDescription && (
                <Text
                  style={{
                    color: "#6B6478",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    margin: "0 0 12px 0",
                    whiteSpace: "pre-line" as const,
                  }}
                >
                  {reminderDescription}
                </Text>
              )}

              <Text
                style={{
                  color: "#7C3AED",
                  fontSize: "13px",
                  fontWeight: "500",
                  margin: "0",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                📅 {formattedDate}
              </Text>
            </Section>

            {/* CTA Button */}
            <Section style={{ textAlign: "center" as const }}>
              <Button
                href={vaultUrl}
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                  color: "#ffffff",
                  padding: "14px 32px",
                  borderRadius: "50px",
                  fontWeight: "600",
                  fontSize: "15px",
                  textDecoration: "none",
                  display: "inline-block",
                  boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                }}
              >
                Abrir meu Vault →
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: "#F3F4F6", margin: "0" }} />
          <Section style={{ padding: "20px 40px" }}>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: "12px",
                margin: "0",
                lineHeight: "1.6",
                textAlign: "center" as const,
              }}
            >
              Este e-mail foi enviado automaticamente pelo{" "}
              <strong style={{ color: "#7C3AED" }}>Vault</strong>.
              <br />
              Você recebe este aviso porque criou um lembrete em sua conta.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
