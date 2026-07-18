import { Html, Head, Body, Container, Heading, Text, Button, Preview } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Vault — seu cofre digital pessoal</Preview>
      <Body style={{ backgroundColor: "#FAF5FF", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px" }}>
          <Heading style={{ color: "#1E1B2E" }}>Bem-vindo, {name}!</Heading>
          <Text style={{ color: "#6B6478", fontSize: 15, lineHeight: 1.6 }}>
            Sua conta no Vault foi criada com sucesso. Agora você tem 500 MB grátis para guardar
            imagens, PDFs, áudios, notas, snippets, links e senhas — tudo em um só lugar.
          </Text>
          <Button
            href="https://vault.app/vault"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A855F7)",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Acessar meu Vault
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
