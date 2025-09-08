import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ForgotPasswordEmailProps {
  resetLink: string;
  email: string;
}

export const ForgotPasswordEmail = ({
  resetLink,
  email,
}: ForgotPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinir sua senha do OrganizeSe</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={logo}>📋 OrganizeSe</Heading>
        </Section>
        
        <Heading style={h1}>Redefinir Senha</Heading>
        
        <Text style={text}>
          Olá! Recebemos uma solicitação para redefinir a senha da sua conta no OrganizeSe ({email}).
        </Text>
        
        <Text style={text}>
          Se você solicitou esta alteração, clique no botão abaixo para criar uma nova senha:
        </Text>
        
        <Section style={buttonSection}>
          <Button style={button} href={resetLink}>
            Redefinir Senha
          </Button>
        </Section>
        
        <Text style={smallText}>
          Este link expira em 1 hora por questões de segurança.
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          Se você não solicitou a redefinição de senha, pode ignorar este email com segurança.
          Sua senha permanecerá inalterada.
        </Text>
        
        <Text style={footerText}>
          Precisa de ajuda? Entre em contato conosco respondendo este email.
        </Text>
        
        <Text style={signature}>
          Equipe OrganizeSe<br />
          <Link href="https://organizese.chromotech.com.br" style={link}>
            organizese.chromotech.com.br
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ForgotPasswordEmail;

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  maxWidth: '580px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
};

const h1 = {
  color: '#1e293b',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '32px 0 24px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const smallText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
};

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '12px 0',
};

const signature = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};