import React, { useState } from 'react';
import { Shield, Flame, CheckCircle2, AlertCircle, Phone, Hash, User, MapPin, Sword, Smartphone, Mic, MessageSquare } from 'lucide-react';
import { ClanRole, DeviceType, GameRegion, Applicant } from '../types';
import { saveApplicant, saveUserSession } from '../services/storageService';
import { sendRecruitToBackend } from '../services/apiService';

interface RecruitmentFormProps {
  onSuccess: (applicant: Applicant) => void;
  onOpenLogin: () => void;
}

const COUNTRY_CODES = [
  { code: '+52', name: 'México (+52)' },
  { code: '+57', name: 'Colombia (+57)' },
  { code: '+54', name: 'Argentina (+54)' },
  { code: '+51', name: 'Perú (+51)' },
  { code: '+56', name: 'Chile (+56)' },
  { code: '+593', name: 'Ecuador (+593)' },
  { code: '+502', name: 'Guatemala (+502)' },
  { code: '+503', name: 'El Salvador (+503)' },
  { code: '+504', name: 'Honduras (+504)' },
  { code: '+505', name: 'Nicaragua (+505)' },
  { code: '+506', name: 'Costa Rica (+506)' },
  { code: '+591', name: 'Bolivia (+591)' },
  { code: '+595', name: 'Paraguay (+595)' },
  { code: '+598', name: 'Uruguay (+598)' },
  { code: '+1', name: 'USA / Canadá (+1)' },
  { code: '+34', name: 'España (+34)' },
];

export const RecruitmentForm: React.FC<RecruitmentFormProps> = ({ onSuccess, onOpenLogin }) => {
  const [gameId, setGameId] = useState('');
  const [nickname, setNickname] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [region, setRegion] = useState<GameRegion>('EEUU');
  const [role, setRole] = useState<ClanRole>('Rusher');
  const [level, setLevel] = useState<number>(65);
  const [device, setDevice] = useState<DeviceType>('Móvil');
  const [micAvailable, setMicAvailable] = useState<boolean>(true);
  const [schedule, setSchedule] = useState('Noches de 8:00 PM a 11:30 PM');
  const [reason, setReason] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplicant, setSubmittedApplicant] = useState<Applicant | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const cleanId = gameId.trim().replace(/\D/g, '');
    if (!cleanId || cleanId.length < 7 || cleanId.length > 13) {
      setErrorMsg('Por favor ingresa un ID de Free Fire válido (entre 7 y 12 dígitos numéricos).');
      return;
    }

    const cleanNick = nickname.trim();
    if (!cleanNick || cleanNick.length < 2) {
      setErrorMsg('Ingresa tu Nickname de Free Fire.');
      return;
    }

    const cleanDigits = phoneNumber.trim().replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 7 || cleanDigits.length > 12) {
      setErrorMsg('Ingresa un número telefónico de WhatsApp válido (sin código de país, solo tus dígitos locales).');
      return;
    }

    const fullPhone = `${countryCode}${cleanDigits}`;

    setIsSubmitting(true);

    try {
      const applicant = saveApplicant({
        gameId: cleanId,
        nickname: cleanNick,
        phone: fullPhone,
        region,
        role,
        level: Number(level),
        device,
        micAvailable,
        schedule: schedule.trim() || 'Horario regular nocturno',
        reason: reason.trim() || 'Deseo competir y crecer como jugador en OF SPARTA.',
      });

      // Save user session so they remain logged in
      saveUserSession({
        phone: fullPhone,
        gameId: cleanId,
        applicantId: applicant.id,
        nickname: applicant.nickname,
      });

      // Send to Render backend & trigger Make.com webhook
      sendRecruitToBackend({
        uid: cleanId,
        nombre: cleanNick,
        telefono: fullPhone,
        rol: role,
        region,
        nivel: Number(level),
        reason,
      }).catch((err) => console.info('Render backend sync info:', err));

      setSubmittedApplicant(applicant);
      onSuccess(applicant);
    } catch (err: any) {
      setErrorMsg('Error al guardar la postulación. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reclutamiento" className="py-20 bg-neutral-900/30 border-t border-neutral-900 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-tactical uppercase tracking-widest text-amber-500 mb-2">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>ALISTAMIENTO ESPARTANO</span>
          </div>
          <h2 className="font-spartan font-bold text-3xl sm:text-4xl text-white tracking-wide uppercase mb-3">
            FORMULARIO DE RECLUTAMIENTO
          </h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto">
            Completa tus datos con precisión. Tu <strong className="text-amber-400">Número de WhatsApp</strong> y tu{' '}
            <strong className="text-amber-400">ID de Free Fire</strong> serán tu usuario y contraseña para ingresar a ver tu estado.
          </p>
        </div>

        {submittedApplicant ? (
          <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-emerald-500/40 rounded-2xl p-8 text-center shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-spartan font-bold text-2xl text-white uppercase mb-2">
              ¡POSTULACIÓN REGISTRADA, GUERRERO!
            </h3>
            <p className="text-sm text-neutral-300 max-w-lg mx-auto mb-6">
              Tu postulación para <span className="text-amber-400 font-semibold">{submittedApplicant.nickname}</span> ha sido enviada al comando del clan OF SPARTA.
            </p>

            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 max-w-md mx-auto text-left mb-6 text-xs space-y-2">
              <div className="text-amber-400 font-tactical uppercase tracking-wider font-semibold">
                Tus credenciales de consulta:
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                <span className="text-neutral-400">Celular / Usuario:</span>
                <span className="font-mono text-white font-medium">{submittedApplicant.phone}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                <span className="text-neutral-400">ID de Juego / Clave:</span>
                <span className="font-mono text-white font-medium">{submittedApplicant.gameId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Estado Inicial:</span>
                <span className="text-amber-400 font-semibold uppercase">Pendiente de Revisión</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSubmittedApplicant(null)}
                className="px-6 py-2.5 rounded-lg text-xs font-tactical uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                Enviar otra solicitud
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950/90 border border-amber-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: ID and Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>ID de Free Fire (Tu Clave de Acceso) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={13}
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 1849204912"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-base px-4 py-3 rounded-xl transition-colors outline-none"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Solo números. Será tu clave secreta para ver si fuiste aceptado.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-200 mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nombre de Usuario / Nickname *</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ej: Leonidas_FF"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white text-base px-4 py-3 rounded-xl transition-colors outline-none"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Tu nombre tal como aparece en el juego Free Fire.
                  </span>
                </div>
              </div>

              {/* Row 2: WhatsApp Number (Usuario de inicio de sesión) */}
              <div>
                <label className="block text-xs font-tactical uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Número de Celular WhatsApp (Tu Usuario de Login) *</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-neutral-200 text-sm px-3 py-3 rounded-xl outline-none"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-neutral-950">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-7">
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej: 5541928374 (sin código de país)"
                      className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono text-base px-4 py-3 rounded-xl transition-colors outline-none"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Los moderadores de OF SPARTA te contactarán a este WhatsApp para la prueba en sala.
                </span>
              </div>

              {/* Row 3: Region, Role, Level, Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Región Free Fire</span>
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as GameRegion)}
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-neutral-200 text-sm px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="EEUU">EEUU (Norteamérica)</option>
                    <option value="SUD">SUD (Sudamérica)</option>
                    <option value="SAC">SAC (Sudamérica Centro)</option>
                    <option value="EUR">EUR (Europa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rol Preferido</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ClanRole)}
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-neutral-200 text-sm px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Rusher">Rusher (Choque)</option>
                    <option value="Soporte">Soporte (Paredes/AR)</option>
                    <option value="Sniper">Sniper (Francotirador)</option>
                    <option value="IGL / Capitán">IGL / Capitán Estratega</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2">
                    Nivel de Cuenta: <span className="text-amber-400 font-bold">{level}</span>
                  </label>
                  <input
                    type="range"
                    min={40}
                    max={85}
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                    <span>Nvl 40</span>
                    <span>Nvl 60 (Recomendado)</span>
                    <span>Nvl 85+</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dispositivo</span>
                  </label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value as DeviceType)}
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-neutral-200 text-sm px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Móvil">Móvil (Android / iOS)</option>
                    <option value="iPad / Tablet">iPad / Tablet</option>
                    <option value="PC / Emulador">PC / Emulador</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Mic availability and schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-tactical uppercase tracking-wider text-white">
                        ¿Cuentas con micrófono activo?
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Indispensable para comunicación en Discord/WhatsApp.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMicAvailable(!micAvailable)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      micAvailable
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {micAvailable ? 'Sí, tengo mic' : 'No tengo mic'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2">
                    Horario Disponible para Jugar
                  </label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="Ej: Noches de 7pm a 11pm"
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white text-sm px-4 py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Row 5: Motivation / Reason */}
              <div>
                <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>¿Por qué quieres unirte a OF SPARTA?</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Cuéntanos brevemente tu experiencia competitiva, si tienes sala propia para prueba o tus metas en el clan..."
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white text-sm p-3 rounded-xl outline-none resize-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-tactical font-bold text-base uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Shield className="w-5 h-5" />
                  <span>{isSubmitting ? 'Enviando Solicitud...' : 'Enviar Solicitud a OF SPARTA'}</span>
                </button>
              </div>

              {/* Link to login for existing applicants */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  ¿Ya enviaste tu solicitud antes?{' '}
                  <span className="text-amber-400 underline font-semibold">
                    Inicia sesión con tu Celular e ID aquí
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};
