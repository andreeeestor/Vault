import { Html, Head, Body, Container, Heading, Text, Preview } from "@react-email/components";

interface SubscriptionUpgradedEmailProps {
  planName: string;
}

export default function SubscriptionUpgradedEmail({ planName }: SubscriptionUpgradedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Seu plano foi atualizado para {planName}</Preview>
      <Body style={{ backgroundColor: "#FAF5FF", fontFamily: "Inter, Arial, sans-serif" }}>
        <Container style={{ padding: "40px 24px" }}>
          <Heading style={{ color: "#1E1B2E" }}>Plano atualizado para {planName} 🎉</Heading>
          <Text style={{ color: "#6B6478", fontSize: 15, lineHeight: 1.6 }}>
            Seu upgrade foi confirmado. Novos limites de armazenamento e recursos já estão
            disponíveis na sua conta.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
