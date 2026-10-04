import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { VALID_LEADER_PASSWORDS } from '../types';
import { setStaffAuthenticated } from '../services/storageService';
import { verifyLeaderPassword } from '../services/apiService';

interface StaffLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const StaffLoginModal: React.FC<StaffLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const entered = password.trim();
    if (!entered) return;

    setIsLoading(true);

    try {
      // 1. Try server-side validation against Render backend
      const serverCheck = await verifyLeaderPassword(entered);

      // 2. Validate either server approved or matches valid leader passwords
      const isClientValid = VALID_LEADER_PASSWORDS.includes(entered);

      if (serverCheck.success || isClientValid) {
        // Save session & password in sessionStorage for authorized actions
        setStaffAuthenticated(true);
        sessionStorage.setItem('sparta_leader_pwd', entered);
        setPassword('');
        onSuccess();
      } else {
        setErrorMsg('Contraseña incorrecta. Acceso denegado solo para líderes de OF SPARTA.');
      }
    } catch {
      if (VALID_LEADER_PASSWORDS.includes(entered)) {
        setStaffAuthenticated(true);
        sessionStorage.setItem('sparta_leader_pwd', entered);
        setPassword('');
        onSuccess();
      } else {
        setErrorMsg('Contraseña incorrecta. Acceso denegado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-950 border border-red-500/40 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/70 border border-red-500/40 flex items-center justify-center text-red-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-spartan font-bold text-base text-white uppercase tracking-wider">
                PANEL DE LÍDERES & STAFF 🔐
              </h3>
              <p className="text-[11px] text-neutral-400">Comandancia Oficial · Clan OF SPARTA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <div className="mb-5 text-center">
            <p className="text-xs text-neutral-300 leading-relaxed">
              Módulo restringido para ver la lista de registrados, auditar con Gameskinbo y{' '}
              <strong className="text-red-400">botar o eliminar</strong> jugadores del clan con contraseña segura.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-tactical uppercase tracking-wider text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Contraseña de Líder *</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña de líder"
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white font-mono text-sm px-4 py-3 rounded-xl outline-none"
              />
              <span className="text-[11px] text-neutral-500 mt-1.5 block">
                Solo líderes y colíderes con credenciales autorizadas.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-tactical font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando Contraseña...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Desbloquear Panel de Líderes</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Cancelar y volver a la web
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
