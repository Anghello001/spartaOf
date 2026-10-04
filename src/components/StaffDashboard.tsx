import React, { useState } from 'react';
import {
  Shield,
  Search,
  Key,
  Users,
  Clock,
  Swords,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Crosshair,
  Trash2,
  Edit3,
  LogOut,
  Save,
  Check,
  Plus,
  RefreshCw,
  Crown,
  Award,
  ArrowUp,
  ArrowDown,
  UserMinus,
  UserPlus,
  Phone,
  Flame,
  AlertTriangle,
  Lock,
  Loader2,
} from 'lucide-react';
import { Applicant, ApplicantStatus, ClanMember, ClanRank, ClanRole, GameRegion } from '../types';
import {
  getApplicants,
  updateApplicantStatus,
  updateApplicantNotes,
  deleteApplicant,
  saveApplicant,
  getClanMembers,
  saveClanMember,
  updateClanMemberRank,
  promoteClanMember,
  demoteClanMember,
  removeClanMember,
} from '../services/storageService';
import {
  getGameskinboPrimaryApiKey,
  saveGameskinboPrimaryApiKey,
  getGameskinboBackupApiKey,
  saveGameskinboBackupApiKey,
} from '../services/gameskinboService';
import { fetchLeaderAll, botarJugadorBackend } from '../services/apiService';
import { GameskinboModal } from './GameskinboModal';

interface StaffDashboardProps {
  onClose: () => void;
  onLogoutStaff: () => void;
}

const RANK_BADGES: Record<ClanRank, { bg: string; text: string; border: string; icon: string }> = {
  Líder: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40', icon: '👑' },
  Colíder: { bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-600/40', icon: '⚔️' },
  Capitán: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', icon: '🎖️' },
  Veterano: { bg: 'bg-zinc-700/30', text: 'text-neutral-200', border: 'border-neutral-600/50', icon: '🛡️' },
  Miembro: { bg: 'bg-neutral-800/40', text: 'text-neutral-300', border: 'border-neutral-700/50', icon: '⚡' },
};

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onClose, onLogoutStaff }) => {
  // Navigation tab: 'peticiones' | 'miembros'
  const [activeTab, setActiveTab] = useState<'peticiones' | 'miembros'>('peticiones');

  // Applicants state
  const [applicants, setApplicants] = useState<Applicant[]>(getApplicants());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | ApplicantStatus>('todos');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Clan members state
  const [clanMembers, setClanMembers] = useState<ClanMember[]>(getClanMembers());
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRankFilter, setMemberRankFilter] = useState<string>('todos');

  // Selected player for Gameskinbo modal
  const [selectedApplicantForStats, setSelectedApplicantForStats] = useState<Applicant | null>(null);

  // Dual Gameskinbo API Keys state
  const [primaryKey, setPrimaryKey] = useState(getGameskinboPrimaryApiKey());
  const [backupKey, setBackupKey] = useState(getGameskinboBackupApiKey());
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Editing notes state
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [memberToKick, setMemberToKick] = useState<ClanMember | null>(null);

  // Quick manual recruit modal fields
  const [newNick, setNewNick] = useState('');
  const [newGameId, setNewGameId] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Leader Password & Server Sync state
  const [leaderPassword, setLeaderPassword] = useState(
    sessionStorage.getItem('sparta_leader_pwd') || 'MiClanFF2026*'
  );
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [serverSyncMessage, setServerSyncMessage] = useState<string | null>(null);

  // Manual Add Clan Member fields
  const [manualGameId, setManualGameId] = useState('');
  const [manualNickname, setManualNickname] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualRank, setManualRank] = useState<ClanRank>('Miembro');
  const [manualRole, setManualRole] = useState<ClanRole>('Rusher');
  const [manualRegion, setManualRegion] = useState<GameRegion>('EEUU');
  const [manualLevel, setManualLevel] = useState<number>(65);

  const refreshList = () => {
    setApplicants(getApplicants());
    setClanMembers(getClanMembers());
  };

  const handleSaveApiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    saveGameskinboPrimaryApiKey(primaryKey);
    saveGameskinboBackupApiKey(backupKey);
    setKeySaved(true);
    setIsEditingKey(false);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleStatusChange = (id: string, newStatus: ApplicantStatus) => {
    const updated = updateApplicantStatus(id, newStatus);
    // If accepted, offer or automatically add to clan members list
    if (newStatus === 'aceptado' && updated) {
      const exists = clanMembers.some((m) => m.gameId === updated.gameId);
      if (!exists) {
        saveClanMember({
          gameId: updated.gameId,
          nickname: updated.nickname.startsWith('⚡SPARTA・') ? updated.nickname : `⚡SPARTA・${updated.nickname}`,
          phone: updated.phone,
          rank: 'Miembro',
          role: updated.role,
          region: updated.region,
          level: updated.level,
        });
      }
    }
    refreshList();
  };

  const handleDelete = async (id: string, nickname?: string) => {
    if (window.confirm(`¿Confirmas botar y eliminar del registro a ${nickname || 'este postulante'}?`)) {
      // Intenta eliminar en backend de Render usando la contraseña de líder
      botarJugadorBackend(id, leaderPassword).catch((err) =>
        console.info('Backend botar info:', err)
      );
      deleteApplicant(id);
      refreshList();
    }
  };

  const handleLoadSolicitudesFromServer = async () => {
    setIsLoadingServer(true);
    setServerSyncMessage(null);
    try {
      const res = await fetchLeaderAll(leaderPassword);
      if (res.success) {
        if (res.reclutas && res.reclutas.length > 0) {
          setApplicants(res.reclutas);
        }
        if (res.miembros && res.miembros.length > 0) {
          setClanMembers(res.miembros);
        }
        setServerSyncMessage('¡Solicitudes cargadas con éxito desde el servidor de Render!');
        setTimeout(() => setServerSyncMessage(null), 4000);
      } else {
        setServerSyncMessage(res.error || 'Contraseña incorrecta o servidor no disponible.');
        setTimeout(() => setServerSyncMessage(null), 5000);
      }
    } catch {
      setServerSyncMessage('Conectando en modo autónomo local.');
      setTimeout(() => setServerSyncMessage(null), 4000);
    } finally {
      setIsLoadingServer(false);
    }
  };

  const handleEditNotes = (app: Applicant) => {
    setEditingNotesId(app.id);
    setNoteText(app.staffNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    updateApplicantNotes(id, noteText);
    setEditingNotesId(null);
    refreshList();
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${clean}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNick || !newGameId || !newPhone) return;

    saveApplicant({
      gameId: newGameId.trim(),
      nickname: newNick.trim(),
      phone: newPhone.trim(),
      region: 'EEUU',
      role: 'Rusher',
      level: 65,
      device: 'Móvil',
      micAvailable: true,
      schedule: 'Noches',
      reason: 'Reclutado directamente por el Staff.',
    });

    setNewNick('');
    setNewGameId('');
    setNewPhone('');
    setShowAddModal(false);
    refreshList();
  };

  // Member Management actions: Promover, Degradar, Botar, Añadir Manual
  const handlePromote = (member: ClanMember) => {
    promoteClanMember(member.id);
    refreshList();
  };

  const handleDemote = (member: ClanMember) => {
    demoteClanMember(member.id);
    refreshList();
  };

  const handleConfirmKick = () => {
    if (!memberToKick) return;
    botarJugadorBackend(memberToKick.id, leaderPassword).catch((err) =>
      console.info('Backend botar miembro info:', err)
    );
    removeClanMember(memberToKick.id);
    setMemberToKick(null);
    refreshList();
  };

  const handleAddMemberManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualGameId.trim().replace(/\D/g, '');
    const cleanNick = manualNickname.trim();
    const cleanPhone = manualPhone.trim().replace(/[\s-]/g, '');

    if (!cleanId || !cleanNick || !cleanPhone) return;

    const formattedNick = cleanNick.startsWith('⚡SPARTA・') ? cleanNick : `⚡SPARTA・${cleanNick}`;

    saveClanMember({
      gameId: cleanId,
      nickname: formattedNick,
      phone: cleanPhone,
      rank: manualRank,
      role: manualRole,
      region: manualRegion,
      level: Number(manualLevel) || 65,
    });

    setManualGameId('');
    setManualNickname('');
    setManualPhone('');
    setManualRank('Miembro');
    setManualLevel(65);
    setShowAddMemberModal(false);
    refreshList();
  };

  // Open Gameskinbo modal for an active clan member
  const handleCheckMemberStats = (m: ClanMember) => {
    const pseudoApplicant: Applicant = {
      id: m.id,
      gameId: m.gameId,
      nickname: m.nickname,
      phone: m.phone,
      region: m.region,
      role: m.role,
      level: m.level,
      device: 'Móvil',
      micAvailable: true,
      schedule: 'Horario oficial',
      reason: `Miembro oficial con rango ${m.rank}`,
      status: 'aceptado',
      createdAt: m.joinedAt,
      updatedAt: m.joinedAt,
    };
    setSelectedApplicantForStats(pseudoApplicant);
  };

  // Filtered applicants
  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch =
      app.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.gameId.includes(searchQuery) ||
      app.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'todos' || app.status === statusFilter;
    const matchesRole = roleFilter === 'todos' || app.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filtered members
  const filteredMembers = clanMembers.filter((m) => {
    const matchesSearch =
      m.nickname.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.gameId.includes(memberSearch) ||
      m.phone.includes(memberSearch);

    const matchesRank = memberRankFilter === 'todos' || m.rank === memberRankFilter;

    return matchesSearch && matchesRank;
  });

  // Counters
  const countPending = applicants.filter((a) => a.status === 'pendiente').length;
  const countTesting = applicants.filter((a) => a.status === 'en_prueba').length;
  const countAccepted = applicants.filter((a) => a.status === 'aceptado').length;
  const countRejected = applicants.filter((a) => a.status === 'rechazado').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Top Banner / Staff Header */}
      <header className="sticky top-0 z-30 bg-neutral-950/95 border-b border-red-500/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-spartan font-black text-lg text-white uppercase tracking-wider">
                  COMANDANCIA DE STAFF
                </span>
                <span className="text-[10px] font-tactical px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 uppercase tracking-widest font-bold">
                  MODERACIÓN ACTIVA
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Gestión de postulaciones y miembros · Clan OF SPARTA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowDeployModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-blue-500/50 text-xs font-tactical uppercase tracking-wider text-neutral-200 transition-colors cursor-pointer"
            >
              <span>🚀 Despliegue (Render / Vercel)</span>
            </button>

            {activeTab === 'miembros' ? (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-tactical font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Añadir Miembro Manual</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-amber-500/40 text-xs font-tactical uppercase tracking-wider text-neutral-200 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Petición Manual</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-tactical uppercase tracking-wider text-neutral-300 border border-neutral-700 transition-colors"
            >
              Volver a la Web
            </button>

            <button
              onClick={onLogoutStaff}
              title="Cerrar sesión de Staff"
              className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-red-950/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Gameskinbo API Integration Master Banner (Dual API with Failover) */}
        <section className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-spartan font-bold text-base text-white">
                  SISTEMA DUAL API GAMESKINBO
                </span>
                <span
                  className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    primaryKey && backupKey
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : primaryKey || backupKey
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  }`}
                >
                  {primaryKey && backupKey
                    ? 'Dual API Activa (Failover Automático) ✓'
                    : primaryKey
                    ? 'API Primaria Conectada'
                    : backupKey
                    ? 'API Secundaria Conectada'
                    : 'Esperando Claves API'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                Audita en tiempo real <strong className="text-amber-400">K/D</strong>,{' '}
                <strong className="text-amber-400">Tiro a la Cabeza %</strong>,{' '}
                <strong className="text-amber-400">Rango de Heroico/Gran Maestro</strong> y nivel de Free Fire.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingKey(!isEditingKey)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-tactical font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Key className="w-4 h-4" />
                <span>{primaryKey || backupKey ? 'Gestionar 2 APIs' : 'Configurar 2 APIs'}</span>
              </button>
            </div>
          </div>

          {/* Dual API configuration panel */}
          {isEditingKey && (
            <form onSubmit={handleSaveApiKeys} className="mt-4 pt-4 border-t border-neutral-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl space-y-1.5">
                  <label className="text-xs font-tactical font-bold uppercase tracking-wider text-neutral-200 block">
                    1. API Key Primaria (Principal):
                  </label>
                  <input
                    type="password"
                    value={primaryKey}
                    onChange={(e) => setPrimaryKey(e.target.value)}
                    placeholder="Pega tu primera clave Gameskinbo..."
                    className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-xl space-y-1.5">
                  <label className="text-xs font-tactical font-bold uppercase tracking-wider text-neutral-200 block">
                    2. API Key Secundaria (Respaldo Automático):
                  </label>
                  <input
                    type="password"
                    value={backupKey}
                    onChange={(e) => setBackupKey(e.target.value)}
                    placeholder="Pega tu segunda clave Gameskinbo..."
                    className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-xs px-3 py-2 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-tactical font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Guardar Ambas APIs
                </button>
                {keySaved && (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Claves guardadas con failover automático.</span>
                  </div>
                )}
              </div>
            </form>
          )}
        </section>

        {/* ======================================================== */}
        {/* PANEL DE CONTROL DE LÍDERES: Contraseña & Cargar Solicitudes */}
        {/* ======================================================== */}
        <section className="bg-neutral-900/90 border border-red-500/50 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-spartan font-bold text-sm text-white uppercase tracking-wider">
                    SEGURIDAD DE LÍDERES (RENDER) 🔐
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 font-bold uppercase">
                    Rutas Protegidas
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Las rutas para ver registrados y <strong className="text-red-400">botar o eliminar</strong> están protegidas con tu contraseña secreta.
                </p>
              </div>
            </div>

            {/* Input de contraseña y botón Cargar Solicitudes */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={leaderPassword}
                  onChange={(e) => {
                    setLeaderPassword(e.target.value);
                    sessionStorage.setItem('sparta_leader_pwd', e.target.value);
                  }}
                  placeholder="Contraseña de Líder"
                  className="w-full sm:w-56 bg-neutral-950 border border-neutral-700 text-xs pl-8 pr-3 py-2 rounded-xl text-white font-mono outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleLoadSolicitudesFromServer}
                disabled={isLoadingServer}
                className="px-4 py-2 bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-tactical font-bold uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isLoadingServer ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cargando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cargar Solicitudes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sync notification */}
          {serverSyncMessage && (
            <div className="mt-3 pt-3 border-t border-neutral-800 text-xs flex items-center gap-2 text-amber-400">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{serverSyncMessage}</span>
            </div>
          )}
        </section>

        {/* PRIMARY STAFF NAVIGATION TABS: Peticiones vs Miembros del Clan */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('peticiones')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-tactical font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'peticiones'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Peticiones de Reclutamiento</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'peticiones' ? 'bg-black text-amber-400' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {applicants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('miembros')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-tactical font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'miembros'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Miembros del Clan (Roster Oficial)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'miembros' ? 'bg-black text-amber-400' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {clanMembers.length}
            </span>
          </button>
        </div>

        {/* TAB 1: PETICIONES DE RECLUTAMIENTO */}
        {activeTab === 'peticiones' && (
          <div className="space-y-6">
            {/* Stat Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
                <div className="text-neutral-400 text-xs font-tactical uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Total Peticiones</span>
                  <Users className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="font-tactical font-bold text-2xl text-white tabular-nums">
                  {applicants.length}
                </div>
              </div>

              <div className="bg-neutral-900/60 border border-amber-500/30 rounded-xl p-4">
                <div className="text-amber-400 text-xs font-tactical uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Pendientes</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-tactical font-bold text-2xl text-amber-400 tabular-nums">
                  {countPending}
                </div>
              </div>

              <div className="bg-neutral-900/60 border border-blue-500/30 rounded-xl p-4">
                <div className="text-blue-400 text-xs font-tactical uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>En Prueba 1v1</span>
                  <Swords className="w-4 h-4 text-blue-400" />
                </div>
                <div className="font-tactical font-bold text-2xl text-blue-400 tabular-nums">
                  {countTesting}
                </div>
              </div>

              <div className="bg-neutral-900/60 border border-emerald-500/30 rounded-xl p-4">
                <div className="text-emerald-400 text-xs font-tactical uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Aceptados</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="font-tactical font-bold text-2xl text-emerald-400 tabular-nums">
                  {countAccepted}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por Nick, ID o Celular..."
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs pl-9 pr-3 py-2 rounded-lg outline-none focus:border-amber-500 text-white font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg outline-none text-neutral-300"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="pendiente">Pendientes ({countPending})</option>
                  <option value="en_prueba">En Sala de Prueba ({countTesting})</option>
                  <option value="aceptado">Aceptados ({countAccepted})</option>
                  <option value="rechazado">Rechazados ({countRejected})</option>
                </select>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-lg outline-none text-neutral-300"
                >
                  <option value="todos">Todos los Roles</option>
                  <option value="Rusher">Rusher</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Sniper">Sniper</option>
                  <option value="IGL / Capitán">IGL / Capitán</option>
                </select>
              </div>
            </div>

            {/* Applicants List */}
            {filteredApplicants.length === 0 ? (
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <h4 className="font-spartan font-bold text-base text-white uppercase mb-1">
                  No hay solicitudes registradas
                </h4>
                <p className="text-xs">
                  Las nuevas solicitudes de ingreso aparecerán aquí inmediatamente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((app) => (
                  <div
                    key={app.id}
                    className="bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 transition-all shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-spartan font-bold text-amber-400 text-lg">
                          {app.nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-spartan font-bold text-base text-white">
                              {app.nickname}
                            </span>
                            <span
                              className={`text-[10px] font-tactical px-2 py-0.5 rounded-full font-bold uppercase ${
                                app.status === 'pendiente'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : app.status === 'en_prueba'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                                  : app.status === 'aceptado'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
                              }`}
                            >
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 font-mono mt-0.5 flex flex-wrap gap-2">
                            <span>ID: <strong className="text-amber-400 font-bold">{app.gameId}</strong></span>
                            <span>·</span>
                            <span>Cel: <strong className="text-neutral-300">{app.phone}</strong></span>
                            <span>·</span>
                            <span>Región: {app.region}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setSelectedApplicantForStats(app)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-amber-500/40 hover:border-amber-400 text-amber-400 text-xs font-tactical font-semibold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>Stats Gameskinbo</span>
                        </button>

                        <button
                          onClick={() =>
                            handleOpenWhatsApp(
                              app.phone,
                              `⚔️ Saludos ${app.nickname}, te contactamos del Clan OF SPARTA (ID ${app.gameId}). Revisamos tu postulación.`
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50 text-emerald-300 text-xs font-tactical font-semibold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(app.id, 'en_prueba')}
                          className="px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-500/40 text-blue-300 hover:bg-blue-900/60 text-xs font-tactical font-semibold uppercase transition-colors"
                        >
                          Citar a 1v1
                        </button>

                        <button
                          onClick={() => handleStatusChange(app.id, 'aceptado')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-tactical font-semibold uppercase transition-colors"
                        >
                          Aceptar al Clan
                        </button>

                        {/* BOTÓN ROJO DE BOTAR / RECHAZAR SOLICITUD */}
                        <button
                          onClick={() => handleDelete(app.id, app.nickname)}
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-tactical font-bold uppercase flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                          title="Botar o rechazar jugador del registro"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Botar / Rechazar</span>
                        </button>
                      </div>
                    </div>

                    {/* Applicant details */}
                    <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-neutral-500 block">Rol:</span>
                        <span className="text-white font-semibold">{app.role}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Nivel FF:</span>
                        <span className="text-white font-semibold">Nvl {app.level}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Dispositivo:</span>
                        <span className="text-white font-semibold">{app.device}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Micrófono:</span>
                        <span className="text-white font-semibold">{app.micAvailable ? 'Sí ✓' : 'No ✕'}</span>
                      </div>
                    </div>

                    {/* Staff Notes */}
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                      {editingNotesId === app.id ? (
                        <div className="flex gap-2 w-full">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Añade notas del staff (ej: probado en sala 1v1, buena puntería)..."
                            className="flex-1 bg-neutral-950 border border-neutral-700 text-xs px-3 py-1.5 rounded-lg text-white outline-none"
                          />
                          <button
                            onClick={() => handleSaveNotes(app.id)}
                            className="px-3 py-1.5 bg-amber-500 text-black font-tactical font-bold uppercase rounded-lg"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-neutral-400 italic">
                            Nota de Staff: {app.staffNotes || 'Sin notas internas.'}
                          </span>
                          <button
                            onClick={() => handleEditNotes(app)}
                            className="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar Nota</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MIEMBROS OFICIALES DEL CLAN (ROSTER CON PROMOVER / BOTAR / AÑADIR MANUAL) */}
        {activeTab === 'miembros' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-spartan font-bold text-lg text-white uppercase tracking-wider">
                    GESTIÓN DE MIEMBROS OFICIALES
                  </h3>
                  <span className="text-xs font-tactical px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                    {clanMembers.length} / 50 Guerreros
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Promueve de rango, degrada o bota miembros del clan. Agrega números de WhatsApp e IDs manualmente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Buscar por Nick, ID o Celular..."
                    className="w-full bg-neutral-950 border border-neutral-800 text-xs pl-8 pr-3 py-2 rounded-xl outline-none focus:border-amber-500 text-white font-mono"
                  />
                </div>

                <select
                  value={memberRankFilter}
                  onChange={(e) => setMemberRankFilter(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 text-xs px-3 py-2 rounded-xl outline-none text-neutral-300"
                >
                  <option value="todos">Todos los Rangos</option>
                  <option value="Líder">Líder (👑)</option>
                  <option value="Colíder">Colíder (⚔️)</option>
                  <option value="Capitán">Capitán (🎖️)</option>
                  <option value="Veterano">Veterano (🛡️)</option>
                  <option value="Miembro">Miembro (⚡)</option>
                </select>

                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-tactical font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Añadir Miembro Manual</span>
                </button>
              </div>
            </div>

            {/* Members List Table / Cards */}
            {filteredMembers.length === 0 ? (
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <h4 className="font-spartan font-bold text-base text-white uppercase mb-1">
                  No se encontraron miembros
                </h4>
                <p className="text-xs mb-4">No hay guerreros que coincidan con la búsqueda.</p>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="px-4 py-2 bg-amber-500 text-black text-xs font-tactical font-bold uppercase rounded-xl"
                >
                  Añadir el Primer Miembro
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredMembers.map((member) => {
                  const badge = RANK_BADGES[member.rank] || RANK_BADGES.Miembro;
                  return (
                    <div
                      key={member.id}
                      className="bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Member Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-spartan font-bold text-base text-amber-400 shrink-0">
                          {badge.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-spartan font-bold text-base text-white">
                              {member.nickname}
                            </span>
                            <span
                              className={`text-[10px] font-tactical px-2 py-0.5 rounded-full font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {member.rank}
                            </span>
                            <span className="text-[10px] font-tactical uppercase text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                              {member.role}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 font-mono mt-1 flex flex-wrap items-center gap-2.5">
                            <span>
                              ID:{' '}
                              <strong className="text-amber-400 font-semibold">{member.gameId}</strong>
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <Phone className="w-3 h-3 text-emerald-500" />
                              <span>{member.phone}</span>
                            </span>
                            <span>·</span>
                            <span>Nvl {member.level}</span>
                            <span>·</span>
                            <span className="text-neutral-500">{member.region}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Promover, Degradar, Botar, WhatsApp, Stats) */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* WhatsApp direct contact */}
                        <button
                          onClick={() =>
                            handleOpenWhatsApp(
                              member.phone,
                              `⚔️ Saludos ${member.nickname}, te escribe la administración de OF SPARTA.`
                            )
                          }
                          title="Enviar WhatsApp"
                          className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/40 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>

                        {/* Check Gameskinbo Stats */}
                        <button
                          onClick={() => handleCheckMemberStats(member)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-amber-500/40 hover:border-amber-400 text-amber-400 text-xs font-tactical uppercase flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                          <span>Stats</span>
                        </button>

                        {/* PROMOVER RANGO */}
                        <button
                          onClick={() => handlePromote(member)}
                          disabled={member.rank === 'Líder'}
                          title="Promover al rango superior"
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-amber-500/50 hover:bg-amber-500 hover:text-black text-amber-300 text-xs font-tactical uppercase font-bold flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          <span>Promover</span>
                        </button>

                        {/* DEGRADAR RANGO */}
                        <button
                          onClick={() => handleDemote(member)}
                          disabled={member.rank === 'Miembro'}
                          title="Degradar al rango inferior"
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 hover:bg-neutral-800 text-neutral-400 text-xs font-tactical uppercase flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                          <span>Degradar</span>
                        </button>

                        {/* BOTAR / EXPULSAR DEL CLAN */}
                        <button
                          onClick={() => setMemberToKick(member)}
                          title="Botar del clan"
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/50 hover:bg-red-900 text-red-300 text-xs font-tactical uppercase font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span>Botar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: AÑADIR MIEMBRO MANUALMENTE (ID Y NÚMEROS) */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-950 border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h4 className="font-spartan font-bold text-base text-white uppercase tracking-wider">
                  AÑADIR MIEMBRO MANUAL AL CLAN
                </h4>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Registra directamente a un integrante que ya forma parte de OF SPARTA ingresando su{' '}
              <strong className="text-amber-400">ID de Free Fire</strong> y su{' '}
              <strong className="text-emerald-400">número de WhatsApp</strong>.
            </p>

            <form onSubmit={handleAddMemberManualSubmit} className="space-y-4">
              {/* Free Fire ID */}
              <div>
                <label className="text-xs font-tactical uppercase tracking-wider text-amber-300 block mb-1 font-bold">
                  1. ID de Free Fire *
                </label>
                <input
                  type="text"
                  required
                  value={manualGameId}
                  onChange={(e) => setManualGameId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 1849204912"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
                />
              </div>

              {/* Nickname */}
              <div>
                <label className="text-xs font-tactical uppercase tracking-wider text-neutral-200 block mb-1 font-bold">
                  2. Nombre / Nickname en el Juego *
                </label>
                <input
                  type="text"
                  required
                  value={manualNickname}
                  onChange={(e) => setManualNickname(e.target.value)}
                  placeholder="Ej: ARES_PRO o LEONIDAS"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-neutral-500 block mt-1">
                  Se le antepondrá automáticamente el tag <code className="text-amber-400">⚡SPARTA・</code> si no lo tiene.
                </span>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-tactical uppercase tracking-wider text-emerald-400 block mb-1 font-bold">
                  3. WhatsApp / Celular con Código de País *
                </label>
                <input
                  type="text"
                  required
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="Ej: +525512345678 o +573109876543"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>

              {/* Rango y Rol */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-tactical uppercase text-neutral-400 block mb-1">
                    Rango en el Clan:
                  </label>
                  <select
                    value={manualRank}
                    onChange={(e) => setManualRank(e.target.value as ClanRank)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Miembro">Miembro (⚡)</option>
                    <option value="Veterano">Veterano (🛡️)</option>
                    <option value="Capitán">Capitán (🎖️)</option>
                    <option value="Colíder">Colíder (⚔️)</option>
                    <option value="Líder">Líder (👑)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-tactical uppercase text-neutral-400 block mb-1">
                    Rol en Escuadra:
                  </label>
                  <select
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value as ClanRole)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Rusher">Rusher</option>
                    <option value="Soporte">Soporte</option>
                    <option value="Sniper">Sniper</option>
                    <option value="IGL / Capitán">IGL / Capitán</option>
                  </select>
                </div>
              </div>

              {/* Región y Nivel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-tactical uppercase text-neutral-400 block mb-1">
                    Región:
                  </label>
                  <select
                    value={manualRegion}
                    onChange={(e) => setManualRegion(e.target.value as GameRegion)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="EEUU">EEUU (Norteamérica)</option>
                    <option value="SUD">SUD (Sudamérica)</option>
                    <option value="SAC">SAC</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-tactical uppercase text-neutral-400 block mb-1">
                    Nivel de Cuenta:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={manualLevel}
                    onChange={(e) => setManualLevel(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black text-xs font-tactical font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Guardar Miembro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: BOTAR / EXPULSAR MIEMBRO DEL CLAN */}
      {memberToKick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-950 border border-red-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="font-spartan font-bold text-base text-white uppercase">
                ¿EXPULSAR DEL CLAN?
              </h4>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              ¿Estás seguro de que deseas botar a{' '}
              <strong className="text-white">{memberToKick.nickname}</strong> (ID:{' '}
              <span className="font-mono text-amber-400">{memberToKick.gameId}</span>, Rango:{' '}
              <span className="text-neutral-200">{memberToKick.rank}</span>) del Clan OF SPARTA?
            </p>
            <p className="text-[11px] text-neutral-500">
              Esta acción lo removerá de la lista oficial de miembros en el panel y en la web pública.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToKick(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmKick}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-tactical font-bold uppercase rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Confirmar Expulsión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gameskinbo Stats Modal */}
      <GameskinboModal
        isOpen={Boolean(selectedApplicantForStats)}
        applicant={selectedApplicantForStats}
        onClose={() => setSelectedApplicantForStats(null)}
        onUpdateStatus={(status) => {
          if (selectedApplicantForStats) {
            handleStatusChange(selectedApplicantForStats.id, status);
          }
        }}
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* Deployment Guide Modal (Render & Vercel/Netlify) */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-950 border border-neutral-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <h4 className="font-spartan font-bold text-lg text-white uppercase">
                  COMPATIBILIDAD DE DESPLIEGUE EN PRODUCCIÓN
                </h4>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              El repositorio ha sido configurado y probado para funcionar nativamente tanto en{' '}
              <strong className="text-amber-400">Render (Backend Node.js/Express)</strong> como en{' '}
              <strong className="text-blue-400">Vercel y Netlify (Frontend ultra-rápido)</strong>:
            </p>

            <div className="space-y-4">
              <div className="bg-neutral-900/80 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-tactical font-bold text-sm text-amber-400 uppercase tracking-wider">
                    A. Render (render.com) — Servidor Completo
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase">
                    Configurado ✓
                  </span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                  <li><strong>Archivo de arranque:</strong> <code className="text-amber-300 font-mono">server.ts</code> con Express y soporte de variables de entorno.</li>
                  <li><strong>Comando de Build:</strong> <code className="text-amber-300 font-mono">npm install && npm run build</code></li>
                  <li><strong>Comando de Start:</strong> <code className="text-amber-300 font-mono">npm run start</code> (ejecuta <code className="text-amber-300 font-mono">tsx server.ts</code>)</li>
                  <li><strong>Endpoint Keep-Alive:</strong> <code className="text-amber-300 font-mono">/api/health</code> para evitar que se duerma el plan gratis.</li>
                </ul>
              </div>

              <div className="bg-neutral-900/80 border border-blue-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-tactical font-bold text-sm text-blue-400 uppercase tracking-wider">
                    B. Vercel (vercel.com) o Netlify (netlify.com) — Frontend Global
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold uppercase">
                    Configurado ✓
                  </span>
                </div>
                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                  <li><strong>Vercel:</strong> Archivo <code className="text-blue-300 font-mono">vercel.json</code> añadido con reglas SPA.</li>
                  <li><strong>Netlify:</strong> Archivo <code className="text-blue-300 font-mono">netlify.toml</code> añadido con directorio <code className="text-blue-300 font-mono">dist</code>.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDeployModal(false)}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-tactical font-bold uppercase rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Recruit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-700 rounded-xl w-full max-w-md p-6 space-y-4">
            <h4 className="font-tactical font-bold text-base text-white uppercase">
              Registrar Petición de Recluta Manual
            </h4>
            <form onSubmit={handleAddManual} className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Nickname:</label>
                <input
                  type="text"
                  required
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  placeholder="Leonidas_FF"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">ID de Free Fire:</label>
                <input
                  type="text"
                  required
                  value={newGameId}
                  onChange={(e) => setNewGameId(e.target.value.replace(/\D/g, ''))}
                  placeholder="1849204912"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">WhatsApp:</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+525512345678"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs px-3 py-2 rounded-lg outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black text-xs font-tactical font-bold uppercase rounded-lg"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
