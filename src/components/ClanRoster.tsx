import React, { useState } from 'react';
import { Shield, Crown, Swords, Award, Search, Crosshair, Users, Sparkles, UserCheck } from 'lucide-react';
import { ClanMember, ClanRank } from '../types';

interface ClanRosterProps {
  members: ClanMember[];
}

const RANK_BADGE_STYLES: Record<ClanRank, { bg: string; text: string; border: string; icon: string }> = {
  Líder: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    icon: '👑',
  },
  Colíder: {
    bg: 'bg-amber-600/20',
    text: 'text-amber-400',
    border: 'border-amber-600/40',
    icon: '⚔️',
  },
  Capitán: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    icon: '🎖️',
  },
  Veterano: {
    bg: 'bg-zinc-700/30',
    text: 'text-neutral-200',
    border: 'border-neutral-600/50',
    icon: '🛡️',
  },
  Miembro: {
    bg: 'bg-neutral-800/40',
    text: 'text-neutral-300',
    border: 'border-neutral-700/50',
    icon: '⚡',
  },
};

export const ClanRoster: React.FC<ClanRosterProps> = ({ members }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rankFilter, setRankFilter] = useState<string>('todos');

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.gameId.includes(searchQuery);

    const matchesRank =
      rankFilter === 'todos' ||
      (rankFilter === 'liderazgo' && (m.rank === 'Líder' || m.rank === 'Colíder')) ||
      (rankFilter === 'capitanes' && m.rank === 'Capitán') ||
      (rankFilter === 'veteranos' && m.rank === 'Veterano') ||
      (rankFilter === 'miembros' && m.rank === 'Miembro');

    return matchesSearch && matchesRank;
  });

  return (
    <section id="miembros" className="py-20 bg-neutral-950 border-t border-neutral-900 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-amber-500/30 text-xs font-tactical font-semibold tracking-widest uppercase text-amber-400 mb-3">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>ALINEACIÓN OFICIAL · CLAN OF SPARTA</span>
          </div>
          <h2 className="font-spartan font-black text-3xl sm:text-5xl text-white tracking-wide uppercase mb-4">
            GUERREROS ESPARTANOS
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-sans">
            Conoce a los miembros activos que defienden el estandarte de OF SPARTA en salas 4v4,
            torneos de liga y batallas competitivas.
          </p>
        </div>

        {/* Minimalist Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-8">
          {/* Quick Filters with native mobile horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'liderazgo', label: '👑 Liderazgo' },
              { id: 'capitanes', label: '🎖️ Capitanes' },
              { id: 'veteranos', label: '🛡️ Veteranos' },
              { id: 'miembros', label: '⚡ Miembros' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRankFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-tactical uppercase tracking-wider transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  rankFilter === f.id
                    ? 'bg-amber-500 text-black font-bold shadow-md'
                    : 'bg-neutral-900/90 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search box & counter */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Nick o ID..."
                className="w-full bg-neutral-900/80 border border-neutral-800 text-neutral-200 text-xs sm:text-xs pl-8 pr-3 py-2.5 sm:py-2 rounded-xl outline-none focus:border-amber-500 font-mono transition-colors"
              />
            </div>
            <span className="text-xs font-tactical text-neutral-400 whitespace-nowrap bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-800 shrink-0">
              <strong className="text-amber-400">{filteredMembers.length}</strong> / {members.length}
            </span>
          </div>
        </div>

        {/* Minimalist Visual Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-8">
            <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No se encontraron miembros con el criterio de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => {
              const badge = RANK_BADGE_STYLES[member.rank] || RANK_BADGE_STYLES.Miembro;
              return (
                <div
                  key={member.id}
                  className="bg-neutral-900/70 border border-neutral-800/80 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden group"
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-tactical font-bold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{member.rank}</span>
                    </span>

                    <span className="text-[10px] font-tactical uppercase text-neutral-500 tracking-wider">
                      {member.region}
                    </span>
                  </div>

                  {/* Player Nickname */}
                  <div className="font-spartan font-bold text-base text-white truncate mb-1 group-hover:text-amber-400 transition-colors">
                    {member.nickname}
                  </div>

                  {/* Free Fire ID */}
                  <div className="text-xs text-neutral-400 font-mono mb-3 flex items-center gap-1">
                    <span className="text-neutral-500">ID:</span>
                    <span className="text-neutral-300 font-semibold">{member.gameId}</span>
                  </div>

                  {/* Member Stats / Tags (Minimalist) */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400 font-tactical">
                    <span className="flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-amber-500" />
                      <span>{member.role}</span>
                    </span>
                    <span className="text-neutral-500 font-mono">
                      Nvl {member.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
