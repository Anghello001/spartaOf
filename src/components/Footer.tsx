import React from 'react';
import { Shield, MessageCircle, Lock, Flame } from 'lucide-react';

interface FooterProps {
  onOpenApplicantPortal: () => void;
  onOpenStaffModal: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenApplicantPortal,
  onOpenStaffModal,
  onScrollToSection,
}) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Clan Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-amber-500/50 flex items-center justify-center text-amber-500">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-spartan font-black text-lg text-white tracking-wider">
                CLAN OF SPARTA
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-md">
              Hermandad competitiva de Free Fire dedicada a dominar las salas de Scrims, torneos 4v4 y ligas
              latinoamericanas con disciplina, honor y fuego.
            </p>
            <div className="text-[11px] text-amber-500 font-tactical uppercase tracking-wider">
              "¡Spartans, cuál es su oficio! ¡Aú, Aú, Aú!"
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <span className="font-tactical font-bold text-white uppercase tracking-wider text-xs block mb-2">
              Navegación
            </span>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onScrollToSection('inicio')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('requisitos')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Requisitos de Ingreso
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('miembros')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Miembros Oficiales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('reglas')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Reglamento Interno
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('reclutamiento')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Formulario de Reclutamiento
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portals & Staff */}
          <div className="space-y-2">
            <span className="font-tactical font-bold text-white uppercase tracking-wider text-xs block mb-2">
              Comandos & Portales
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenApplicantPortal}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Consultar Estado (Celular e ID)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStaffModal}
                  className="flex items-center gap-1.5 text-neutral-300 hover:text-red-400 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 text-red-500" />
                  <span>Acceso Staff & Moderación</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('reclutamiento')}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Alistarse Ahora</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} Clan OF SPARTA · Todos los derechos reservados.
          </div>
          <div className="text-center sm:text-right">
            Sitio web oficial de la comunidad. No afiliado directamente a Garena International.
          </div>
        </div>
      </div>
    </footer>
  );
};
