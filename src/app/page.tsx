'use client';

import { useState, useEffect } from 'react';
import { Calendar, Phone, Mail, MapPin, Heart, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import AgendamentoFormMelhorado from '@/components/AgendamentoFormMelhorado';
import PsicologaInfo from '@/components/PsicologaInfo';
import LoginModal from '@/components/LoginModal';
import SignUpModal from '@/components/SignUpModal';

// Centralized configuration for easier updates
// Added a comment to force recompile
const config = {
  professionalName: "Dra. Jandira Frederick",
  crp: "06/123456",
  contact: {
    phone: "(11) 99999-9999",
    email: "contato@drajandira.com.br",
    address: "Rua das Flores, 123<br />São Paulo - SP",
  },
  faq: [
    {
      question: "Como funciona o agendamento?",
      answer: "Você pode agendar sua consulta através do nosso sistema online. Selecione a data e horário disponível, preencha seus dados e receberá uma confirmação por WhatsApp."
    },
    {
      question: "Posso cancelar ou remarcar minha consulta?",
      answer: "Sim, você pode cancelar ou remarcar com até 24 horas de antecedência. Entre em contato conosco pelo WhatsApp ou telefone."
    },
    {
      question: "Qual o valor da consulta?",
      answer: "O valor da consulta é R$ 150,00."
    }
  ]
};

export default function Home() {
  const [showAgendamento, setShowAgendamento] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleOpenSignUp = () => {
    setShowLoginModal(false); // Close login modal
    setShowSignUpModal(true); // Open signup modal
  };

  const handleCloseSignUp = () => {
    setShowSignUpModal(false);
  };

  useEffect(() => {
    if (showLoginModal || showSignUpModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showLoginModal, showSignUpModal]);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">{config.professionalName}</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => setShowAgendamento(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2 shadow-lg transform hover:scale-105"
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Agendar Consulta</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Cuidando da sua saúde mental com acolhimento e profissionalismo
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Oferecemos um espaço seguro e acolhedor para você trabalhar suas questões emocionais 
              e desenvolver ferramentas para uma vida mais equilibrada e saudável.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Atendimento presencial e online</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span>Horários flexíveis</span>
              </div>
            </div>
          </div>
        </section>

        {/* Informações da Psicóloga */}
        <PsicologaInfo />

        {/* Seção de Contato */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Entre em Contato
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Telefone</h4>
                <p className="text-gray-600">{config.contact.phone}</p>
              </div>
              <div className="text-center">
                <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">E-mail</h4>
                <p className="text-gray-600">{config.contact.email}</p>
              </div>
              <div className="text-center">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Endereço</h4>
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: config.contact.address }} />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Perguntas Frequentes
            </h3>
            <div className="space-y-6">
              {config.faq.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.question}
                  </h4>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} {config.professionalName} - Psicóloga CRP {config.crp}. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Este site está em conformidade com a LGPD e garante a proteção dos seus dados pessoais.
          </p>
        </div>
      </footer>

      {/* Agendamento Modal */}
      {showAgendamento && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAgendamento(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors z-10"
              aria-label="Fechar modal de agendamento"
            >
              <X className="h-8 w-8" />
            </button>
            <div className="p-8">
              <AgendamentoFormMelhorado />
            </div>
          </div>
        </div>
      )}

      <LoginModal showModal={showLoginModal} onClose={() => setShowLoginModal(false)} onOpenSignUp={handleOpenSignUp} />
      <SignUpModal showModal={showSignUpModal} onClose={handleCloseSignUp} />
    </div>
  );
}
