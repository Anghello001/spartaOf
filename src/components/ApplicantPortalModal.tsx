import React, { useState } from 'react';
import { X, Shield, CheckCircle2, Clock, Swords, XCircle, LogOut, Phone, Hash, ArrowRight, MessageCircle, AlertCircle } from 'lucide-react';
import { Applicant, UserSession } from '../types';
import { authenticateUser, getApplicants, saveUserSession, clearUserSession } from '../services/storageService';

interface ApplicantPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  onSessionChange: (session: UserSession | null) => void;
  onScrollToForm: () => void;
}

export const ApplicantPortalModal: React.FC<ApplicantPortalModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onSessionChange,
  onScrollToForm,
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [gameIdInput, setGameIdInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  if (!isOpen) return null;

  // If user is already logged in, find their current applicant record
  const currentApplicant: Applicant | undefined = userSession
    ? getApplicants().find((a) => a.id === userSession.applicantId || a.gameId === userSession.gameId)
    : undefined;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanPhone = phoneInput.trim().replace(/[\s-]/g, '');
    const cleanId = gameIdInput.trim().replace(/\D/g, '');

    if (!cleanPhone || !cleanId) {
      setLoginError('Por favor completa tanto tu número de celular como tu ID.');
      return;
    }

    const matched = authenticateUser(cleanPhone, cleanId);
    if (!matched) {
      setLoginError(
        'No se encontró ninguna postulación con este número de celular e ID. Verifica los dígitos o envía una nueva solicitud en el formulario.'
      );
      return;
    }

    const session: UserSession = {
      phone: matched.phone,
      gameId: matched.gameId,
      applicantId: matched.id,
      nickname: matched.nickname,
    };
    saveUserSession(session);
    onSessionChange(session);
  };

  const handleLogout = () => {
    clearUserSession();
    onSessionChange(null);
  };

  const renderStatusCard = (applicant: Applicant) => {
    switch (applicant.status) {
      case 'pendiente':
        return (
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-tactical uppercase tracking-wider font-bold mb-2">
              ESTADO: EN REVISIÓN DE STAFF
            </div>
            <h4 className="font-spartan font-bold text-xl text-white mb-2">
              Tu postulación está siendo evaluada
            </h4>
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
              Los capitanes y moderadores de <strong className="text-amber-400">OF SPARTA</strong> están revisando tu
              perfil y estadísticas de Free Fire. Si cumples con el perfil, te contactarán a tu WhatsApp registrado.
            </p>
          </div>
        );

      case 'en_prueba':
        return (
          <div className="bg-blue-950/40 border border-blue-500/50 rounded-2xl p-6 text-center shadow-lg">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto mb-3">
              <Swords className="w-8 h-8 animate-bounce" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-tactical uppercase tracking-wider font-bold mb-2">
              ESTADO: CITADO A SALA DE PRUEBA 1V1 / 4V4
            </div>
            <h4 className="font-spartan font-bold text-xl text-white mb-2">
              ¡Prepárate para combatir!
            </h4>
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed mb-4">
              Has sido preseleccionado. Un moderador de OF SPARTA te enviará un mensaje por WhatsApp para fijar
              la hora de tu sala de prueba para evaluar tu movimiento, puntería y comunicación.
            </p>
            {applicant.staffNotes && (
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-left text-xs text-neutral-300 max-w-md mx-auto">
                <span className="text-blue-400 font-tactical uppercase font-bold block mb-1">
                  Nota del Capitán:
                </span>
                {applicant.staffNotes}
              </div>
            )}
          </div>
        );

      case 'aceptado':
        return (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-tactical uppercase tracking-wider font-bold mb-2">
              ESTADO: ¡OFICIALMENTE ACEPTADO!
            </div>
            <h4 className="font-spartan font-bold text-2xl text-white mb-2">
              ¡BIENVENIDO A OF SPARTA!
            </h4>
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed mb-5">
              Has demostrado la casta y el honor necesarios para portar el manto espartano. Recuerda colocarte el
              tag oficial <strong className="text-amber-400">⚡SPARTA・</strong> en los próximos 7 días.
            </p>

            <a
              href="https://chat.whatsapp.com/sample-of-sparta-guild"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-tactical font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Unirse al Grupo Oficial de WhatsApp</span>
            </a>
          </div>
        );

      case 'rechazado':
        return (
          <div className="bg-neutral-900 border border-red-500/30 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-3">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-tactical uppercase tracking-wider font-bold mb-2">
              ESTADO: NO SELECCIONADO EN ESTA ETAPA
            </div>
            <h4 className="font-spartan font-bold text-xl text-white mb-2">
              Convocatoria no superada
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed mb-4">
              Gracias por tu interés en OF SPARTA. Por el momento tu postulación no cumple con todos los requisitos
              competitivos actuales del clan.
            </p>
            {applicant.staffNotes && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-left text-xs text-neutral-400 max-w-md mx-auto mb-4">
                <span className="text-red-400 font-tactical uppercase font-bold block mb-1">
                  Motivo indicado por Moderación:
                </span>
                {applicant.staffNotes}
              </div>
            )}
            <button
              onClick={() => {
                onClose();
                onScrollToForm();
              }}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              Mejorar datos y postular nuevamente
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-950 border border-amber-500/30 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        {/* Modal Header */}
        <div className="sticky top-0 bg-neutral-950/95 border-b border-neutral-800 px-6 py-4 flex items-center justify-between z-10 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-spartan font-bold text-base text-white uppercase tracking-wider">
                PORTAL DEL RECLUTA
              </h3>
              <p className="text-[11px] text-neutral-400">
                Consulta el estado de tu postulación a OF SPARTA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {currentApplicant ? (
            /* Logged In View */
            <div className="space-y-6">
              {renderStatusCard(currentApplicant)}

              {/* Applicant Profile Information */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
                  <span className="font-tactical font-bold text-xs uppercase tracking-wider text-amber-400">
                    Datos de tu registro
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    ID Ref: {currentApplicant.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Nickname:</span>
                    <span className="text-white font-semibold">{currentApplicant.nickname}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">ID de Free Fire:</span>
                    <span className="text-amber-400 font-mono font-semibold">{currentApplicant.gameId}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">WhatsApp:</span>
                    <span className="text-white font-mono">{currentApplicant.phone}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Región / Rol:</span>
                    <span className="text-white">
                      {currentApplicant.region} · {currentApplicant.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Nivel Registrado:</span>
                    <span className="text-white font-semibold">Nivel {currentApplicant.level}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Micrófono:</span>
                    <span className={currentApplicant.micAvailable ? 'text-emerald-400' : 'text-neutral-400'}>
                      {currentApplicant.micAvailable ? 'Disponible ✓' : 'No reportado'}
                    </span>
                  </div>
                </div>

                {currentApplicant.reason && (
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 text-xs">
                    <span className="text-neutral-500 block text-[11px]">Mensaje enviado:</span>
                    <p className="text-neutral-300 italic mt-0.5">"{currentApplicant.reason}"</p>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión de recluta</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-tactical font-semibold uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          ) : (
            /* Login Form View */
            <div>
              <div className="text-center mb-6">
                <h4 className="font-spartan font-bold text-xl text-white mb-1">
                  INICIAR SESIÓN DE RECLUTA
                </h4>
                <p className="text-xs text-neutral-400">
                  Ingresa tu número de WhatsApp y tu ID de Free Fire para ver el estado de tu petición.
                </p>
              </div>

              {loginError && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Número de Celular WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Ej: +525541928374 o tus dígitos"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white text-sm px-4 py-3 rounded-xl outline-none"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    El mismo número con el que enviaste la postulación.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>ID de Free Fire (Tu Clave) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={gameIdInput}
                    onChange={(e) => setGameIdInput(e.target.value)}
                    placeholder="Ej: 1849204912"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white font-mono text-sm px-4 py-3 rounded-xl outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-tactical font-bold text-sm uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ingresar y Consultar Estado</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
                <p className="text-xs text-neutral-400">
                  ¿Aún no has enviado tu postulación?{' '}
                  <button
                    onClick={() => {
                      onClose();
                      onScrollToForm();
                    }}
                    className="text-amber-400 font-semibold underline hover:text-amber-300"
                  >
                    Llena el formulario aquí
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
