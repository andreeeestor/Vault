import { Html, Head, Body, Container, Heading, Text, Button, Preview } from "@react-email/components";

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export default function ResetPasswordEmail({ resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Redefina sua senha do Vault</Preview>
      <Body style={{ backgroundColor: "#FAF5FF", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px" }}>
          <Heading style={{ color: "#1E1B2E" }}>Redefinir senha</Heading>
          <Text style={{ color: "#6B6478", fontSize: 15, lineHeight: 1.6 }}>
            Recebemos uma solicitação para redefinir sua senha. Se não foi você, ignore este e-mail.
          </Text>
          <Button
            href={resetUrl}
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A855F7)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Criar nova senha
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
