import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o teste gratuito?",
    answer: "Oferecemos 7 dias grátis para 1 usuário testar todas as funcionalidades. Após esse período, você pode solicitar ao suporte uma prorrogação do teste se necessário."
  },
  {
    question: "É seguro armazenar dados empresariais no OrganizeSe?",
    answer: "Absolutamente. Utilizamos criptografia de ponta a ponta, certificação SSL, backups automáticos e hospedagem em servidores seguros. Estamos em conformidade com a LGPD e seguimos as melhores práticas de segurança."
  },
  {
    question: "Como funciona o suporte ao cliente?",
    answer: "Oferecemos suporte via WhatsApp para todos os planos. É rápido, prático e em português! Nosso time está sempre pronto para ajudar."
  },
  {
    question: "E se minha equipe crescer?",
    answer: "Você pode fazer upgrade do plano Individual (1 usuário) para o Profissional (até 10 usuários) ou consultar o suporte para adicionar novos membros conforme necessário."
  },
  {
    question: "Existe versão mobile?",
    answer: "O OrganizeSe é 100% responsivo e funciona perfeitamente em qualquer dispositivo - desktop, tablet ou celular. Acesse suas tarefas de qualquer lugar com a mesma experiência."
  },
  {
    question: "Como funciona o período de teste?",
    answer: "Oferecemos 7 dias grátis para testar todas as funcionalidades dos planos Individual e Profissional. Não é necessário cartão de crédito para começar o teste."
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, não há contratos ou multas. Você pode cancelar sua assinatura a qualquer momento e fazer download dos seus dados."
  },
  {
    question: "Vocês oferecem treinamento para a equipe?",
    answer: "Sim! Temos uma base de conhecimento completa, webinars regulares e, para clientes Enterprise, oferecemos treinamento personalizado e onboarding assistido."
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Dúvidas <span className="text-primary">frequentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Encontre respostas para as perguntas mais comuns sobre o OrganizeSe. 
            Se não encontrar o que procura, entre em contato conosco.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ainda tem dúvidas?
            </h3>
            <p className="text-muted-foreground mb-6">
              Nossa equipe está pronta para ajudar! Entre em contato e teremos prazer em esclarecer qualquer questão.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/5511969169869?text=Olá! Preciso de ajuda com o OrganizeSe."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                💬 Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}