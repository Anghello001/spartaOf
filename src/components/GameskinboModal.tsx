import React, { useState, useEffect } from 'react';
import { X, Shield, RefreshCw, Key, ExternalLink, Check, AlertCircle, Trophy, Crosshair, Award, Flame, UserCheck, MessageSquare } from 'lucide-react';
import { GameskinboPlayerData, Applicant } from '../types';
import {
  fetchGameskinboStats,
  getGameskinboPrimaryApiKey,
  saveGameskinboPrimaryApiKey,
  getGameskinboBackupApiKey,
  saveGameskinboBackupApiKey,
} from '../services/gameskinboService';

interface GameskinboModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onUpdateStatus?: (status: Applicant['status']) => void;
  onOpenWhatsApp?: (phone: string, text: string) => void;
}

export const GameskinboModal: React.FC<GameskinboModalProps> = ({
  isOpen,
  applicant,
  onClose,
  onUpdateStatus,
  onOpenWhatsApp,
}) => {
  const [loading, setLoading] = useState(false);
  const [playerStats, setPlayerStats] = useState<GameskinboPlayerData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [fromLiveApi, setFromLiveApi] = useState(false);
  const [activeKeyType, setActiveKeyType] = useState<'primary' | 'backup' | 'none'>('none');

  // Key configuration mini-form
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputPrimaryKey, setInputPrimaryKey] = useState(getGameskinboPrimaryApiKey());
  const [inputBackupKey, setInputBackupKey] = useState(getGameskinboBackupApiKey());
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  const loadStats = async (app: Applicant) => {
    setLoading(true);
    try {
      const res = await fetchGameskinboStats(app.gameId, app.nickname);
      setPlayerStats(res.data);
      setStatusMessage(res.message);
      setFromLiveApi(res.fromLiveApi);
      setActiveKeyType(res.activeKeyType);
    } catch (err: any) {
      console.error('Error in stats query:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && applicant) {
      loadStats(applicant);
      setInputPrimaryKey(getGameskinboPrimaryApiKey());
      setInputBackupKey(getGameskinboBackupApiKey());
    } else {
      setPlayerStats(null);
    }
  }, [isOpen, applicant]);

  if (!isOpen || !applicant) return null;

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    saveGameskinboPrimaryApiKey(inputPrimaryKey);
    saveGameskinboBackupApiKey(inputBackupKey);
    setKeySavedMessage(true);
    setTimeout(() => setKeySavedMessage(false), 2500);
    // Reload stats with new keys
    loadStats(applicant);
  };

  const hasAnyKey = Boolean(getGameskinboPrimaryApiKey() || getGameskinboBackupApiKey());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-950 border border-amber-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-950/95 border-b border-neutral-800 px-6 py-4 flex items-center justify-between z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-spartan font-bold text-base text-white uppercase tracking-wider">
                  ESTADÍSTICAS GAMESKINBO API
                </h3>
                <span
                  className={`text-[10px] font-tactical px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    activeKeyType === 'primary'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : activeKeyType === 'backup'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {activeKeyType === 'primary'
                    ? 'API Primaria ✓'
                    : activeKeyType === 'backup'
                    ? 'API Secundaria (Respaldo) ⚡'
                    : 'Modo Demo / Preview'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Jugador: <strong className="text-white">{applicant.nickname}</strong> (ID:{' '}
                <span className="font-mono text-amber-400">{applicant.gameId}</span>)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadStats(applicant)}
              disabled={loading}
              title="Volver a consultar"
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Gameskinbo Dual API Key Config Banner */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-tactical uppercase tracking-wider text-amber-400 font-bold">
                <Key className="w-3.5 h-3.5" />
                <span>Configuración Dual API Gameskinbo</span>
              </div>
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-xs text-neutral-400 hover:text-amber-400 underline cursor-pointer"
              >
                {showKeyInput ? 'Ocultar' : hasAnyKey ? 'Gestionar 2 APIs' : 'Ingresar Claves API'}
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-2 leading-relaxed">
              {statusMessage ||
                'Sistema Dual: consulta la API Primaria y, si agota su cuota de peticiones, conmuta automáticamente a la API Secundaria.'}
            </p>

            {showKeyInput && (
              <form onSubmit={handleSaveKeys} className="mt-3 pt-3 border-t border-neutral-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-tactical uppercase text-neutral-300 block mb-1">
                      1. API Primaria:
                    </label>
                    <input
                      type="password"
                      value={inputPrimaryKey}
                      onChange={(e) => setInputPrimaryKey(e.target.value)}
                      placeholder="Clave Primaria..."
                      className="w-full bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-tactical uppercase text-neutral-300 block mb-1">
                      2. API Secundaria (Respaldo):
                    </label>
                    <input
                      type="password"
                      value={inputBackupKey}
                      onChange={(e) => setInputBackupKey(e.target.value)}
                      placeholder="Clave de Respaldo..."
                      className="w-full bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-tactical font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar y Probar
                  </button>
                  {keySavedMessage && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Claves API actualizadas.</span>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
              <div className="font-spartan text-white font-semibold text-sm">
                CONSULTANDO GAMESKINBO API...
              </div>
              <p className="text-xs text-neutral-400 mt-1">Extrayendo datos de Garena Free Fire</p>
            </div>
          ) : playerStats ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-neutral-800 border-2 border-amber-500/60 overflow-hidden flex items-center justify-center font-spartan font-bold text-2xl text-amber-400">
                      {playerStats.avatarUrl ? (
                        <img
                          src={playerStats.avatarUrl}
                          alt={playerStats.nickname}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span>{playerStats.nickname.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-amber-500 text-black font-tactical font-black text-[10px] uppercase shadow">
                      Nvl {playerStats.level}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-spartan font-bold text-xl text-white">
                      {playerStats.nickname}
                    </h4>
                    <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>ID: {playerStats.playerId}</span>
                      <span>·</span>
                      <span className="text-amber-400">Likes: {playerStats.likes.toLocaleString()}</span>
                    </div>
                    {playerStats.guildName && (
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Clan actual:{' '}
                        <span className="text-neutral-200 font-semibold">{playerStats.guildName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="text-xs font-tactical uppercase text-neutral-400">Rango Battle Royale</div>
                  <div className="font-tactical font-black text-lg text-amber-400 uppercase tracking-wide">
                    {playerStats.rankBR}
                  </div>
                  {playerStats.rankBRScore && (
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {playerStats.rankBRScore.toLocaleString()} pts
                    </div>
                  )}
                </div>
              </div>

              {/* Core Combat Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-tactical uppercase tracking-wider text-neutral-400 block mb-1">
                    K/D Ratio
                  </span>
                  <span
                    className={`font-tactical text-2xl font-bold tabular-nums ${
                      playerStats.kdRatio >= 2.5 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {playerStats.kdRatio}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {playerStats.kdRatio >= 2.5 ? 'Aprobado ✓' : 'Bajo requisito'}
                  </span>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-tactical uppercase tracking-wider text-neutral-400 block mb-1">
                    Headshots %
                  </span>
                  <span
                    className={`font-tactical text-2xl font-bold tabular-nums ${
                      playerStats.headshotRate >= 40 ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    {playerStats.headshotRate}%
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">Tiro a la cabeza</span>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-tactical uppercase tracking-wider text-neutral-400 block mb-1">
                    Rango D.E. (CS)
                  </span>
                  <span className="font-tactical text-lg font-bold text-amber-300">
                    {playerStats.rankCS}
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {playerStats.rankCSStars ? `${playerStats.rankCSStars} Estrellas` : 'Clasificatoria'}
                  </span>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-tactical uppercase tracking-wider text-neutral-400 block mb-1">
                    Partidas / Winrate
                  </span>
                  <span className="font-tactical text-2xl font-bold text-white tabular-nums">
                    {playerStats.winRate}%
                  </span>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">
                    {playerStats.matchesPlayed} jugadas
                  </span>
                </div>
              </div>

              {/* Bio / Signature */}
              {playerStats.bio && (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3.5 text-xs">
                  <span className="text-neutral-500 block text-[11px] font-tactical uppercase mb-1">
                    Firma de Jugador Free Fire:
                  </span>
                  <p className="text-neutral-300 italic">"{playerStats.bio}"</p>
                </div>
              )}

              {/* Staff Direct Decision Actions */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
                <div className="text-xs font-tactical uppercase tracking-wider text-neutral-300 font-semibold mb-3">
                  Acciones Rápidas del Staff para este Recluta:
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {onUpdateStatus && (
                    <>
                      <button
                        onClick={() => {
                          onUpdateStatus('en_prueba');
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-tactical font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        ⚔️ Citar a Sala 1v1 / 4v4
                      </button>

                      <button
                        onClick={() => {
                          onUpdateStatus('aceptado');
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-tactical font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        ✓ Aceptar al Clan
                      </button>

                      <button
                        onClick={() => {
                          onUpdateStatus('rechazado');
                          onClose();
                        }}
                        className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 border border-neutral-700 text-xs font-tactical uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        ✕ Rechazar
                      </button>
                    </>
                  )}

                  {onOpenWhatsApp && (
                    <button
                      onClick={() => {
                        const defaultMsg = `Hola ${applicant.nickname}, te escribimos de la comandancia del clan OF SPARTA (Free Fire). Hemos revisado tus estadísticas de tu ID ${applicant.gameId}.`;
                        onOpenWhatsApp(applicant.phone, defaultMsg);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 text-xs font-tactical font-bold uppercase tracking-wider transition-colors cursor-pointer ml-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                      Contactar por WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400 text-xs">
              No se pudieron cargar las estadísticas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
