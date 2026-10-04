export type ApplicantStatus = 'pendiente' | 'en_prueba' | 'aceptado' | 'rechazado';

export type ClanRole = 'Rusher' | 'Soporte' | 'Sniper' | 'IGL / Capitán';

export type GameRegion = 'EEUU' | 'SUD' | 'SAC' | 'EUR';

export type DeviceType = 'Móvil' | 'iPad / Tablet' | 'PC / Emulador';

export type ClanRank = 'Líder' | 'Colíder' | 'Capitán' | 'Veterano' | 'Miembro';

export interface ClanMember {
  id: string;
  gameId: string; // Free Fire ID
  nickname: string;
  phone: string; // WhatsApp (visible solo en Staff)
  rank: ClanRank;
  role: ClanRole;
  region: GameRegion;
  level: number;
  joinedAt: string;
}

export interface GameskinboPlayerData {
  playerId: string;
  nickname: string;
  level: number;
  exp: number;
  likes: number;
  rankBR: string;
  rankBRScore?: number;
  rankCS: string;
  rankCSStars?: number;
  kdRatio: number;
  headshotRate: number; // percentage, e.g. 52.4%
  matchesPlayed: number;
  wins: number;
  winRate: number; // percentage, e.g. 45.2%
  guildName?: string;
  guildId?: string;
  avatarUrl?: string;
  bio?: string;
  lastActive?: string;
  isRealApiData: boolean;
  rawResponse?: any;
}

export interface Applicant {
  id: string;
  gameId: string; // Free Fire ID (clave)
  nickname: string;
  phone: string; // WhatsApp number (usuario de login)
  region: GameRegion;
  role: ClanRole;
  level: number;
  device: DeviceType;
  micAvailable: boolean;
  schedule: string;
  reason: string;
  status: ApplicantStatus;
  staffNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  phone: string;
  gameId: string;
  applicantId: string;
  nickname: string;
}

export const STAFF_MASTER_KEY = 'sparta001oficial';
export const LEADER_DEFAULT_PASSWORD = 'MiClanFF2026*';
export const VALID_LEADER_PASSWORDS = ['MiClanFF2026*', 'sparta001oficial'];
export const CLAN_NAME = 'OF SPARTA';
export const CLAN_TAG_PREFIX = '⚡SPARTA・';
