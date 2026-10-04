import React, { useState } from 'react';
import { Shield, Lock, Unlock, UserCheck, LogOut, Menu, X, Flame } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  userSession: UserSession | null;
  isStaff: boolean;
  onOpenApplicantPortal: () => void;
  onOpenStaffModal: () => void;
  onOpenStaffDashboard: () => void;
  onLogoutApplicant: () => void;
  onLogoutStaff: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userSession,
  isStaff,
  onOpenApplicantPortal,
  onOpenStaffModal,
  onOpenStaffDashboard,
  onLogoutApplicant,
  onLogoutStaff,
  onScrollToSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Zone 1: Single text wordmark with Spartan crest */}
        <div
          onClick={() => onScrollToSection('inicio')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-amber-500/50 bg-neutral-900 flex items-center justify-center shadow-lg group-hover:border-amber-400 transition-colors">
            <img
              src="/src/assets/images/crest_clan_sparta_1791136820676.jpg"
              alt="OF SPARTA Crest"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to shield icon
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <Shield className="w-6 h-6 text-amber-500 absolute" />
          </div>
          <div className="flex flex-col">
            <span className="font-spartan font-bold text-xl tracking-wider text-amber-400 group-hover:text-amber-300 transition-colors">
              OF SPARTA
            </span>
            <span className="font-tactical text-xs tracking-widest text-neutral-400 uppercase -mt-1">
              CLAN FREE FIRE
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text links) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onScrollToSection('inicio')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Inicio
          </button>
          <button
            onClick={() => onScrollToSection('requisitos')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Requisitos
          </button>
          <button
            onClick={() => onScrollToSection('miembros')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Miembros
          </button>
          <button
            onClick={() => onScrollToSection('reglas')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Reglamento
          </button>
          <button
            onClick={() => onScrollToSection('reclutamiento')}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Reclutamiento
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Applicant Portal & Staff Access) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Applicant Session / Check status */}
          {userSession ? (
            <div className="flex items-center gap-2 bg-neutral-900/90 border border-emerald-500/40 rounded-lg p-1 pr-3">
              <button
                onClick={onOpenApplicantPortal}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate max-w-[120px]">{userSession.nickname}</span>
                <span className="text-neutral-500 text-[10px]">(Mi Estado)</span>
              </button>
              <button
                onClick={onLogoutApplicant}
                title="Cerrar sesión de recluta"
                className="text-neutral-400 hover:text-red-400 p-1 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenApplicantPortal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900 border border-neutral-700 rounded-lg hover:border-amber-500/50 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Consultar Mi Estado</span>
            </button>
          )}

          {/* Quick Apply CTA */}
          <button
            onClick={() => onScrollToSection('reclutamiento')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Postularme</span>
          </button>

          {/* Staff Access Portal */}
          {isStaff ? (
            <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 rounded-lg p-1 pr-2">
              <button
                onClick={onOpenStaffDashboard}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              >
                <Unlock className="w-3.5 h-3.5 text-red-400" />
                <span>Panel Staff</span>
              </button>
              <button
                onClick={onLogoutStaff}
                title="Cerrar sesión de staff"
                className="text-neutral-400 hover:text-red-400 p-1 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenStaffModal}
              title="Acceso para Moderadores y Capitanes"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-400 bg-neutral-900/60 border border-neutral-800 rounded-lg hover:border-red-500/40 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-red-500/80" />
              <span>Staff</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          {isStaff && (
            <button
              onClick={onOpenStaffDashboard}
              className="px-2.5 py-1 text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/50 rounded"
            >
              Staff
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white rounded-lg bg-neutral-900"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-amber-500/20 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm">
            <button
              onClick={() => {
                onScrollToSection('inicio');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-900 text-neutral-200"
            >
              Inicio
            </button>
            <button
              onClick={() => {
                onScrollToSection('requisitos');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-900 text-neutral-200"
            >
              Requisitos
            </button>
            <button
              onClick={() => {
                onScrollToSection('miembros');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-900 text-neutral-200"
            >
              Miembros
            </button>
            <button
              onClick={() => {
                onScrollToSection('reglas');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-900 text-neutral-200"
            >
              Reglamento
            </button>
            <button
              onClick={() => {
                onScrollToSection('reclutamiento');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded hover:bg-neutral-900 text-neutral-200"
            >
              Reclutamiento
            </button>
          </nav>

          <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
            {userSession ? (
              <div className="flex items-center justify-between bg-neutral-900 p-2.5 rounded-lg">
                <button
                  onClick={() => {
                    onOpenApplicantPortal();
                    setMobileMenuOpen(false);
                  }}
                  className="text-emerald-400 text-xs font-semibold"
                >
                  Postulación de {userSession.nickname} (Ver)
                </button>
                <button onClick={onLogoutApplicant} className="text-red-400 text-xs">
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenApplicantPortal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2 text-xs font-semibold text-neutral-300 bg-neutral-900 rounded-lg border border-neutral-700"
              >
                Consultar Estado de Mi Postulación (Login)
              </button>
            )}

            <button
              onClick={() => {
                onScrollToSection('reclutamiento');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-amber-500 rounded-lg text-center"
            >
              Postularme al Clan
            </button>

            {isStaff ? (
              <button
                onClick={() => {
                  onOpenStaffDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-bold text-red-400 bg-red-950/80 border border-red-500/50 rounded-lg text-center"
              >
                Panel de Moderación Staff
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenStaffModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-medium text-neutral-400 bg-neutral-900/50 border border-neutral-800 rounded-lg text-center"
              >
                Acceso Staff & Moderación
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
