import React, { useState, useEffect } from 'react';
import {
  Flame,
  Shield,
  Trophy,
  Users,
  Crosshair,
  ArrowDown,
  UserCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Crown,
  Swords,
  Award,
} from 'lucide-react';
import { Applicant, UserSession, ClanMember, ClanRank } from '../types';

interface HeroProps {
  userSession: UserSession | null;
  applicant: Applicant | null;
  members: ClanMember[];
  onGoToForm: () => void;
  onOpenLogin: () => void;
  onViewMembers?: () => void;
}

const RANK_ICONS: Record<ClanRank, { icon: string; color: string; bg: string; border: string }> = {
  Líder: { icon: '👑', color: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/50' },
  Colíder: { icon: '⚔️', color: 'text-amber-400', bg: 'bg-amber-600/20', border: 'border-amber-600/50' },
  Capitán: { icon: '🎖️', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' },
  Veterano: { icon: '🛡️', color: 'text-neutral-200', bg: 'bg-zinc-700/30', border: 'border-zinc-600/50' },
  Miembro: { icon: '⚡', color: 'text-amber-400', bg: 'bg-neutral-800/40', border: 'border-neutral-700/50' },
};

export const Hero: React.FC<HeroProps> = ({
  userSession,
  applicant,
  members,
  onGoToForm,
  onOpenLogin,
  onViewMembers,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Rotación dinámica automática cada 4.5 segundos para que TODOS los miembros tengan su oportunidad en portada
  useEffect(() => {
    if (!members || members.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % members.length);
      setProgressKey((k) => k + 1);
    }, 4500);

    return () => clearInterval(interval);
  }, [members, isPaused, members?.length]);

  const activeMember = members && members.length > 0 ? members[currentIndex % members.length] : null;
  const activeBadge = activeMember ? RANK_ICONS[activeMember.rank] || RANK_ICONS.Miembro : null;

  const handleNext = () => {
    if (!members || members.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % members.length);
    setProgressKey((k) => k + 1);
  };

  const handlePrev = () => {
    if (!members || members.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + members.length) % members.length);
    setProgressKey((k) => k + 1);
  };

  const handleRandom = () => {
    if (!members || members.length === 0) return;
    const rand = Math.floor(Math.random() * members.length);
    setCurrentIndex(rand);
    setProgressKey((k) => k + 1);
  };

  return (
    <section id="inicio" className="relative min-h-[88vh] flex flex-col items-center justify-center overflow-hidden py-14 lg:py-20">
      {/* Background Hero Image with dark cinematic scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_clan_sparta_1791136806097.jpg"
          alt="Clan OF SPARTA Free Fire Battlefield"
          className="w-full h-full object-cover object-center filter brightness-[0.42] contrast-125 scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        {/* Atmospheric Spartan gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
        <div className="absolute inset-0 bg-radial-at-c from-amber-600/15 via-transparent to-neutral-950/90" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
        {/* Editorial Eyebrow */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-neutral-900/90 border border-amber-500/40 text-[10px] sm:text-xs font-tactical font-semibold tracking-wider sm:tracking-widest uppercase text-amber-400 backdrop-blur-sm shadow-lg max-w-full">
          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">CONVOCATORIA OFICIAL 2026 · CLAN FREE FIRE</span>
        </div>

        {/* Marquee Display Title */}
        <h1 className="font-spartan font-black text-3xl sm:text-5xl lg:text-7xl text-white tracking-wide uppercase leading-tight drop-shadow-2xl text-balance">
          CLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">OF SPARTA</span>
        </h1>

        {/* Spartan Motto */}
        <p className="font-tactical text-base sm:text-2xl lg:text-3xl text-amber-400/90 font-medium tracking-wider uppercase drop-shadow max-w-3xl mx-auto px-2">
          "¡Honor, Gloria o Muerte! En la arena solo los fuertes prevalecen."
        </p>

        {/* Narrative Description */}
        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Buscamos guerreros de Free Fire disciplinados para nuestras escuadras competitivas de
          Duelo de Escuadras (4v4), Scrims nocturnas y Torneos de Liga. Al completar tu postulación,
          tu cuenta se crea al instante para dar seguimiento a tu admisión.
        </p>

        {/* User Session Banner (if logged in) */}
        {userSession && (
          <div className="inline-flex items-center gap-3 bg-neutral-900/90 border border-emerald-500/40 px-5 py-2.5 rounded-xl text-xs backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-300">
              Sesión activa de recluta:{' '}
              <strong className="text-white font-semibold">{userSession.nickname}</strong> (ID:{' '}
              <span className="font-mono text-amber-400">{userSession.gameId}</span>)
            </span>
            <span className="text-emerald-400 font-tactical uppercase font-bold text-[11px] ml-1">
              · {applicant?.status ? `Estado: ${applicant.status.toUpperCase()}` : 'Registrado'}
            </span>
          </div>
        )}

        {/* ACTION BUTTONS: Botón para ir al formulario rápidamente */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-1">
          <button
            onClick={onGoToForm}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-tactical font-black text-base uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Flame className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
            <span>Ir al Formulario de Reclutamiento</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-tactical font-semibold text-base uppercase tracking-wider text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Consultar Estado (Celular e ID)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN DINÁMICA DE INTEGRANTES EN PORTADA PRINCIPAL     */}
        {/* ======================================================== */}
        <div
          className="max-w-3xl mx-auto pt-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {activeMember && activeBadge ? (
            <div className="bg-neutral-950/85 border border-amber-500/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-amber-400/70">
              {/* Animated Progress bar indicating rotation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-800 overflow-hidden">
                <div
                  key={progressKey}
                  className={`h-full bg-gradient-to-r from-amber-500 to-amber-300 ${
                    isPaused ? 'w-full' : 'animate-[progress_4.5s_linear]'
                  }`}
                  style={{ animationDuration: '4.5s' }}
                />
              </div>

              {/* Header with dynamic indicator */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-tactical uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Guerrero en Portada Dinámica
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                  <span>
                    <strong className="text-white font-bold">{currentIndex + 1}</strong> / {members.length} miembros
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-neutral-400 hidden sm:inline">Rotación equitativa</span>
                </div>
              </div>

              {/* Active Member Showcase Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold border shadow-inner ${activeBadge.bg} ${activeBadge.border}`}>
                    {activeBadge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-spartan font-black text-lg sm:text-xl text-white tracking-wide">
                        {activeMember.nickname}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-tactical font-bold uppercase tracking-wider border ${activeBadge.bg} ${activeBadge.color} ${activeBadge.border}`}>
                        {activeBadge.icon} {activeMember.rank}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mt-1 flex-wrap">
                      <span>ID FF: <strong className="text-amber-400 font-bold">{activeMember.gameId}</strong></span>
                      <span>·</span>
                      <span>Rol: <strong className="text-neutral-200">{activeMember.role}</strong></span>
                      <span>·</span>
                      <span>Nvl: <strong className="text-neutral-200">{activeMember.level}</strong></span>
                      <span>·</span>
                      <span>Región: <strong className="text-neutral-200">{activeMember.region}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Controls (Next, Prev, Random, View All) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    onClick={handlePrev}
                    title="Guerrero anterior"
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRandom}
                    title="Aleatorio"
                    className="px-2.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 hover:text-amber-300 text-xs font-tactical uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Aleatorio</span>
                  </button>
                  <button
                    onClick={handleNext}
                    title="Siguiente guerrero"
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {onViewMembers && (
                    <button
                      onClick={onViewMembers}
                      className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-tactical uppercase font-bold transition-colors cursor-pointer ml-1"
                    >
                      Ver Todos
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 text-center text-xs text-neutral-400">
              <span className="text-amber-400 font-semibold font-tactical uppercase">¡Alineación Espartana Abierta!</span> Sé el primer guerrero en postularte y liderar la portada.
            </div>
          )}
        </div>

        {/* Proof of Dominance & Clan Quantified Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2 text-left">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-tactical uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Escuadrón</span>
            </div>
            <div className="text-2xl font-bold font-tactical tabular-nums text-white">
              {members?.length || 0} <span className="text-xs text-neutral-400 font-normal">/ 50 miembros</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Alineación activa y reclutando</div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-tactical uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Nivel de Clan</span>
            </div>
            <div className="text-2xl font-bold font-tactical tabular-nums text-white">
              Nivel 4 <span className="text-xs text-amber-500 font-normal">MAX</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Placas semanales garantizadas</div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-tactical uppercase tracking-wider mb-1">
              <Crosshair className="w-4 h-4 text-amber-400" />
              <span>Efectividad Scrims</span>
            </div>
            <div className="text-2xl font-bold font-tactical tabular-nums text-emerald-400">
              92.4% <span className="text-xs text-neutral-400 font-normal">Winrate</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Salas 4v4 e invictos</div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-tactical uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Palmarés</span>
            </div>
            <div className="text-2xl font-bold font-tactical tabular-nums text-amber-300">
              14 <span className="text-xs text-neutral-400 font-normal">Copas</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Torneos y ligas ganadas</div>
          </div>
        </div>
      </div>

      {/* Dynamic Continuous Marquee Ribbon at bottom of Hero */}
      {members && members.length > 0 && (
        <div className="w-full mt-10 border-y border-amber-500/20 bg-neutral-950/90 py-2.5 overflow-hidden relative z-10">
          <div className="animate-marquee gap-6 whitespace-nowrap">
            {[...members, ...members, ...members].map((m, idx) => {
              const icon = RANK_ICONS[m.rank]?.icon || '⚡';
              return (
                <div
                  key={`${m.id}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 hover:border-amber-500/50 transition-colors"
                >
                  <span>{icon}</span>
                  <span className="font-spartan font-bold text-white">{m.nickname}</span>
                  <span className="text-amber-400 font-tactical uppercase text-[10px]">· {m.rank}</span>
                  <span className="text-neutral-500 text-[10px]">({m.role})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

