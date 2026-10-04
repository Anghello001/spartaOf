import React, { useState } from 'react';
import { Target, ShieldAlert, Award, Copy, Check, Headphones, Clock, Sparkles } from 'lucide-react';

export const ClanRequirements: React.FC = () => {
  const [testNick, setTestNick] = useState('LUIS');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const cleanName = testNick.trim() || 'GUERRERO';

  const tagVariations = [
    `⚡SPARTA・${cleanName.toUpperCase()}`,
    `亗 SPARTA・${cleanName.toUpperCase()} 亗`,
    `⚔️ OF SPARTA・${cleanName.toUpperCase()}`,
    `乂SPARTA・${cleanName.toUpperCase()}乂`,
  ];

  const handleCopyTag = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section id="requisitos" className="py-20 bg-neutral-950 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-tactical uppercase tracking-widest text-amber-500 mb-2">
            <span>FILTRO COMPETITIVO</span>
            <span>·</span>
            <span>TEMPORADA CLASIFICATORIA</span>
          </div>
          <h2 className="font-spartan font-bold text-3xl sm:text-4xl text-white tracking-wide uppercase mb-4">
            REQUISITOS DE INGRESO
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            En <span className="text-amber-400 font-semibold">OF SPARTA</span> no buscamos jugadores casuales;
            buscamos guerreros comprometidos que luchen hombro a hombro en torneos y salas de honor.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-tactical font-bold text-lg text-white uppercase tracking-wider mb-2">
              Nivel de Cuenta 60+
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Experiencia comprobada en el juego. Si eres nivel 55 a 59 con K/D sobresaliente, puedes solicitar
              una sala de prueba 1v1 especial.
            </p>
            <div className="text-[11px] font-tactical text-amber-400 uppercase tracking-wider">
              Verificable con Gameskinbo
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-tactical font-bold text-lg text-white uppercase tracking-wider mb-2">
              K/D Ratio 2.50+
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Mínimo K/D de 2.50 en Duelo de Escuadras Clasificatoria o BR Heroico con 35%+ porcentaje de tiros
              a la cabeza (Headshots).
            </p>
            <div className="text-[11px] font-tactical text-amber-400 uppercase tracking-wider">
              Enfoque en puntería limpia
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="font-tactical font-bold text-lg text-white uppercase tracking-wider mb-2">
              Micrófono & WhatsApp
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Comunicación fluida y sin eco durante las partidas. Estar activo en el grupo oficial de WhatsApp
              donde se pasan los IDs de las salas.
            </p>
            <div className="text-[11px] font-tactical text-amber-400 uppercase tracking-wider">
              Coordinación obligatoria
            </div>
          </div>

          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-tactical font-bold text-lg text-white uppercase tracking-wider mb-2">
              Horario Nocturno
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Disponibilidad regular entre las 7:00 PM y 11:30 PM (Hora México/Colombia) para Scrims, versus de clanes
              y eventos de placas.
            </p>
            <div className="text-[11px] font-tactical text-amber-400 uppercase tracking-wider">
              Miércoles de placas activo
            </div>
          </div>
        </div>

        {/* Spartan Tag Generator & Rules Section */}
        <div id="reglas" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Rules & Discipline */}
          <div className="lg:col-span-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-tactical uppercase tracking-wider text-red-400 mb-3">
              <ShieldAlert className="w-4 h-4" />
              <span>CÓDIGO DE HONOR ESPARTANO</span>
            </div>
            <h3 className="font-spartan font-bold text-2xl text-white mb-4">
              REGLAS DE CONVIVENCIA
            </h3>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-300">
              <div className="flex items-start gap-3">
                <span className="font-tactical font-bold text-amber-400 text-base">01.</span>
                <div>
                  <strong className="text-white">Cero Toxicidad Interna:</strong> El respeto entre compañeros es
                  innegociable. Se juega con compañerismo; los reclamos destructivos causan expulsión inmediata.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-tactical font-bold text-amber-400 text-base">02.</span>
                <div>
                  <strong className="text-white">Cambio de Nick en 7 Días:</strong> Todo recluta aceptado tiene 7 días
                  para colocarse el tag oficial del clan con tarjeta de cambio de nombre.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-tactical font-bold text-amber-400 text-base">03.</span>
                <div>
                  <strong className="text-white">Disciplina en Sala:</strong> Respetar las indicaciones del IGL
                  (Capitán de escuadra) durante los versus y partidas de torneo.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-tactical font-bold text-amber-400 text-base">04.</span>
                <div>
                  <strong className="text-white">Placas Semanales:</strong> Cada miembro debe aportar mínimo 80 placas los
                  miércoles de torneo para garantizar las salas personalizadas del clan.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Spartan Tag Preview Generator */}
          <div className="lg:col-span-6 bg-gradient-to-br from-neutral-900/90 to-neutral-950 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-tactical uppercase tracking-wider text-amber-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>GENERADOR DE TAG OFICIAL</span>
            </div>
            <h3 className="font-spartan font-bold text-2xl text-white mb-2">
              SIMULA TU NICK ESPARTANO
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Prueba cómo lucirá tu nombre con el tag oficial de <strong className="text-amber-400">OF SPARTA</strong> y
              copia tu favorito para Free Fire.
            </p>

            {/* Input field */}
            <div className="mb-6">
              <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2">
                Ingresa tu Nickname o Nombre:
              </label>
              <input
                type="text"
                maxLength={12}
                value={testNick}
                onChange={(e) => setTestNick(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="Ejemplo: LEONIDAS"
                className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-tactical text-lg px-4 py-3 rounded-xl uppercase tracking-wider transition-colors outline-none"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Máximo 12 caracteres recomendados para que quepa en el límite de Free Fire.
              </span>
            </div>

            {/* Formatted tag choices */}
            <div className="space-y-2.5">
              {tagVariations.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2.5 hover:border-amber-500/40 transition-colors"
                >
                  <span className="font-mono text-sm sm:text-base font-semibold text-amber-300 tracking-wide select-all">
                    {tag}
                  </span>
                  <button
                    onClick={() => handleCopyTag(tag, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-tactical font-semibold uppercase tracking-wider bg-neutral-900 hover:bg-amber-500 hover:text-black text-neutral-200 border border-neutral-700 rounded-lg transition-all cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
