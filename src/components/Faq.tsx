'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '@/config/site';

const faqData = [
  {
    question: "Como funciona a primeira consulta?",
    answer: "Na primeira consulta é feita uma avaliação inicial para entender suas necessidades e definir o plano de atendimento."
  },
  {
    question: "Atendem crianças, adolescentes e adultos?",
    answer: "Sim, realizamos atendimentos em todas as faixas etárias."
  },
  {
    question: "Qual a diferença entre Psicologia e Psicopedagogia?",
    answer: "Psicologia cuida de questões emocionais e comportamentais. Psicopedagogia foca em dificuldades de aprendizagem."
  },
  {
    question: "O atendimento pode ser presencial e online?",
    answer: "Sim, você pode escolher entre consulta presencial ou online."
  },
  {
    question: "Como agendar uma consulta?",
    answer: "O agendamento pode ser feito pelo site, WhatsApp ou telefone."
  },
  {
    question: "Preciso de encaminhamento médico?",
    answer: "Não, você pode marcar diretamente sua consulta."
  },
  {
    question: "Quais formas de pagamento aceitam?",
    answer: "Dinheiro, Pix, cartão de débito e crédito."
  },
  {
    question: "Atendem convênios?",
    answer: "O atendimento é particular, mas fornecemos recibo para reembolso."
  },
  {
    question: "Qual a duração das sessões?",
    answer: "As sessões duram em média 50 minutos."
  },
  {
    question: "Com qual frequência devo marcar as sessões?",
    answer: "Geralmente, uma vez por semana."
  },
  {
    question: "E se eu precisar remarcar ou cancelar?",
    answer: "Avise com pelo menos 24 horas de antecedência."
  },
  {
    question: "Quais demandas a Psicologia atende?",
    answer: "Ansiedade, depressão, estresse, autoestima, luto, entre outras."
  },
  {
    question: "Como saber se meu filho precisa de psicopedagogia?",
    answer: "Se apresenta dificuldades escolares, desatenção ou resistência aos estudos."
  },
  {
    question: "Quais dificuldades de aprendizagem podem ser trabalhadas?",
    answer: "Leitura, escrita, matemática, concentração e organização."
  },
  {
    question: "Vocês fazem avaliações?",
    answer: "Sim, aplicamos testes e avaliações psicopedagógicas."
  },
  {
    question: "Onde fica a clínica?",
    answer: `${siteConfig.contact.addressPlain}.`
  },
  {
    question: "O atendimento online é por qual plataforma?",
    answer: "WhatsApp, Google Meet ou Zoom."
  },
  {
    question: "As informações são confidenciais?",
    answer: "Sim, todas as informações são sigilosas e protegidas pelo Código de Ética."
  },
  {
    question: "Como entro em contato?",
    answer: "Pelo WhatsApp, telefone ou e-mail."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Perguntas Frequentes
        </h3>
        <div className="space-y-6">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => toggleFaq(index)}
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.question}
                </h4>
                <ChevronDown
                  className={`h-6 w-6 text-blue-600 transform transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="mt-4">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}