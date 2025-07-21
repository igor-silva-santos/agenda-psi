'use client';

import { GraduationCap, Award, Users, Clock } from 'lucide-react';
import Image from 'next/image';

export default function PsicologaInfo() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Foto e informações básicas */}
          <div className="text-center lg:text-left">
            <div className="relative w-64 h-64 rounded-full mx-auto lg:mx-0 mb-6 overflow-hidden shadow-lg">
              <Image
                src="/psicologa.jpg"
                alt="Foto da Dra. Jandira Frederick"
                fill
                sizes="(max-width: 1024px) 100vw, 256px"
                className="object-cover transition-transform duration-500 hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '[https://placehold.co/256x256/E0E7FF/4F46E5?text=Dra.+Jandira](https://placehold.co/256x256/E0E7FF/4F46E5?text=Dra.+Jandira)';
                  target.onerror = null;
                }}
              />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Dra. Jandira Frederick
            </h3>
            <p className="text-xl text-blue-600 mb-4">
              Psicóloga Clínica CRP 06/123456
            </p>
            <p className="text-gray-600 text-lg">
              Especialista em Terapia Cognitivo-Comportamental com mais de 10 anos de experiência 
              no atendimento de adultos, adolescentes e casais.
            </p>
          </div>

          {/* Formação e especialidades */}
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 mb-6">
                Formação e Especialidades
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h5 className="font-semibold text-gray-800">Formação Acadêmica</h5>
                    <p className="text-gray-600">
                      Graduação em Psicologia pela USP<br />
                      Mestrado em Psicologia Clínica pela PUC-SP
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h5 className="font-semibold text-gray-800">Especializações</h5>
                    <p className="text-gray-600">
                      Terapia Cognitivo-Comportamental<br />
                      Terapia de Casal e Família<br />
                      Transtornos de Ansiedade e Depressão
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h5 className="font-semibold text-gray-800">Experiência</h5>
                    <p className="text-gray-600">
                      Mais de 10 anos de experiência clínica<br />
                      Atendimento a mais de 500 pacientes<br />
                      Supervisora clínica e professora
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h5 className="font-semibold text-gray-800">Abordagem Terapêutica</h5>
                    <p className="text-gray-600">
                      Utilizo a Terapia Cognitivo-Comportamental, uma abordagem científica 
                      que ajuda a identificar e modificar padrões de pensamento e comportamento 
                      que causam sofrimento emocional.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-3">Áreas de Atuação</h5>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>• Ansiedade e Pânico</div>
                <div>• Depressão</div>
                <div>• Relacionamentos</div>
                <div>• Autoestima</div>
                <div>• Estresse</div>
                <div>• Luto</div>
                <div>• Fobias</div>
                <div>• Terapia de Casal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}