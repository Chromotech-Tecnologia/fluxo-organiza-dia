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

interface WelcomeEmailProps {
  confirmLink: string;
  name: string;
  email: string;
}

export const WelcomeEmail = ({
  confirmLink,
  name,
  email,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao OrganizeSe! Confirme sua conta</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Heading style={logo}>📋 OrganizeSe</Heading>
        </Section>
        
        <Heading style={h1}>Bem-vindo, {name || 'usuário'}! 🎉</Heading>
        
        <Text style={text}>
          Obrigado por se cadastrar no OrganizeSe! Estamos muito felizes em tê-lo conosco.
        </Text>
        
        <Text style={text}>
          Para começar a usar todas as funcionalidades da plataforma, você precisa confirmar seu email.
          É rápido e fácil:
        </Text>
        
        <Section style={buttonSection}>
          <Button style={button} href={confirmLink}>
            Confirmar Minha Conta
          </Button>
        </Section>
        
        <Text style={smallText}>
          Ou copie e cole este link no seu navegador:<br />
          <Link href={confirmLink} style={linkText}>{confirmLink}</Link>
        </Text>
        
        <Hr style={hr} />
        
        <Text style={text}>
          <strong>O que você pode fazer no OrganizeSe:</strong>
        </Text>
        
        <Text style={listText}>
          ✅ Gerenciar suas tarefas diárias<br />
          ✅ Organizar equipes e colaboradores<br />
          ✅ Acompanhar o progresso dos projetos<br />
          ✅ Definir prazos e prioridades<br />
          ✅ Visualizar estatísticas e relatórios
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          Se você não criou esta conta, pode ignorar este email com segurança.
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

export default WelcomeEmail;

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

const listText = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '16px 0',
  paddingLeft: '8px',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#10b981',
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

const linkText = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
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