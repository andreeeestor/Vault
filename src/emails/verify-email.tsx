import { Html, Head, Body, Container, Heading, Text, Button, Preview } from "@react-email/components";

interface VerifyEmailProps {
  verificationUrl: string;
}

export default function VerifyEmail({ verificationUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirme seu e-mail para ativar sua conta Vault</Preview>
      <Body style={{ backgroundColor: "#FAF5FF", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px" }}>
          <Heading style={{ color: "#1E1B2E" }}>Confirme seu e-mail</Heading>
          <Text style={{ color: "#6B6478", fontSize: 15, lineHeight: 1.6 }}>
            Clique no botão abaixo para confirmar seu e-mail e ativar sua conta. Este link expira em
            24 horas.
          </Text>
          <Button
            href={verificationUrl}
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A855F7)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Confirmar e-mail
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
