import React from 'react';
import {
  Flame,
  Shield,
  Trophy,
  Users,
  Crosshair,
  ChevronDown,
  ArrowDown,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { Applicant, UserSession } from '../types';

interface HeroProps {
  userSession: UserSession | null;
  applicant: Applicant | null;
  onGoToForm: () => void;
  onOpenLogin: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  userSession,
  applicant,
  onGoToForm,
  onOpenLogin,
}) => {
  return (
    <section id="inicio" className="relative min-h-[88vh] flex items-center justify-center overflow-hidden py-16 lg:py-24">
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

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
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

        {/* ACTION BUTTONS: Botón para ir al formulario rápidamente arriba del todo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* BOTÓN RÁPIDO AL FORMULARIO */}
          <button
            onClick={onGoToForm}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-tactical font-black text-base uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Flame className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
            <span>Ir al Formulario de Reclutamiento</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>

          {/* Botón de consulta de estado */}
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-7 py-4 rounded-xl font-tactical font-semibold text-base uppercase tracking-wider text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Consultar Estado (Celular e ID)</span>
          </button>
        </div>

        {/* Proof of Dominance & Clan Quantified Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 text-left">
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-2 text-neutral-400 text-xs font-tactical uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Escuadrón</span>
            </div>
            <div className="text-2xl font-bold font-tactical tabular-nums text-white">
              48 <span className="text-xs text-neutral-400 font-normal">/ 50 miembros</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">2 cupos de élite disponibles</div>
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
    </section>
  );
};
