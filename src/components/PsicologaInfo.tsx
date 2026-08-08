'use client';

import { GraduationCap, Award, Users, Clock } from 'lucide-react';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

export default function PsicologaInfo() {
  return (
    <section className="py-16 bg-[#F0FDFA]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-teal-700 mb-2">Consultório de demonstração</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-teal-950">
            Conheça a profissional da demo
          </h3>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="relative w-64 h-64 rounded-full mx-auto lg:mx-0 mb-6 overflow-hidden shadow-lg border-4 border-white">
              <Image
                src={siteConfig.assets.avatar}
                alt={`Foto de ${siteConfig.professionalName}`}
                fill
                sizes="256px"
                className="object-cover"
              />
            </div>
            <h3 className="text-3xl font-bold text-teal-950 mb-2">
              {siteConfig.professionalName}
            </h3>
            <p className="text-xl text-teal-700 mb-2">{siteConfig.professionalTitle}</p>
            <p className="text-md text-teal-900/55 mb-4">CRP — {siteConfig.crp}</p>
            <p className="text-teal-900/70 text-lg">
              Persona fictícia usada para demonstrar o {siteConfig.productName} com
              dados de consultório realistas, sem expor cliente real.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-bold text-teal-950 mb-6">
                Formação e especialidades
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <GraduationCap className="h-6 w-6 text-teal-700 mt-1 shrink-0" />
                  <div>
                    <h5 className="font-semibold text-teal-950">Formação</h5>
                    <p className="text-teal-900/70">
                      {siteConfig.formation.map((line) => (
                        <span key={line}>
                          {line}
                          <br />
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="h-6 w-6 text-teal-700 mt-1 shrink-0" />
                  <div>
                    <h5 className="font-semibold text-teal-950">Especializações</h5>
                    <p className="text-teal-900/70">
                      {siteConfig.specialties.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-teal-700 mt-1 shrink-0" />
                  <div>
                    <h5 className="font-semibold text-teal-950">Para quem é o sistema</h5>
                    <p className="text-teal-900/70">
                      Psicólogas e psicopedagogas que precisam de agenda, portal,
                      financeiro e documentos sem depender de planilhas.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-teal-700 mt-1 shrink-0" />
                  <div>
                    <h5 className="font-semibold text-teal-950">Serviços na demo</h5>
                    <ul className="text-teal-900/70 text-sm space-y-1 mt-1">
                      {siteConfig.services.map((s) => (
                        <li key={s}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
