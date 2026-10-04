import { Applicant, ApplicantStatus, UserSession, ClanMember, ClanRank } from '../types';

const APPLICANTS_STORAGE_KEY = 'sparta_clan_applicants_v2';
const CLAN_MEMBERS_STORAGE_KEY = 'sparta_clan_members_v1';
const USER_SESSION_KEY = 'sparta_user_session';
const STAFF_AUTH_KEY = 'sparta_staff_authenticated';

// Initial existing members of the clan OF SPARTA
const SEED_CLAN_MEMBERS: ClanMember[] = [
  {
    id: 'sparta-mbr-1',
    gameId: '1092837415',
    nickname: '⚡SPARTA・LEONIDAS',
    phone: '+525512340001',
    rank: 'Líder',
    role: 'IGL / Capitán',
    region: 'EEUU',
    level: 79,
    joinedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-2',
    gameId: '1849204981',
    nickname: '⚡SPARTA・ARES',
    phone: '+525512340002',
    rank: 'Colíder',
    role: 'Rusher',
    region: 'EEUU',
    level: 76,
    joinedAt: '2025-02-10T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-3',
    gameId: '2093849182',
    nickname: '⚡SPARTA・ATHENA',
    phone: '+573102340003',
    rank: 'Capitán',
    role: 'Sniper',
    region: 'EEUU',
    level: 74,
    joinedAt: '2025-03-01T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-4',
    gameId: '1540928374',
    nickname: '⚡SPARTA・KRATOS',
    phone: '+549112340004',
    rank: 'Veterano',
    role: 'Rusher',
    region: 'SUD',
    level: 72,
    joinedAt: '2025-04-12T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-5',
    gameId: '2837491028',
    nickname: '⚡SPARTA・VULCAN',
    phone: '+519872340005',
    rank: 'Veterano',
    role: 'Soporte',
    region: 'SUD',
    level: 71,
    joinedAt: '2025-05-20T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-6',
    gameId: '3948201948',
    nickname: '⚡SPARTA・HADES',
    phone: '+525512340006',
    rank: 'Miembro',
    role: 'Rusher',
    region: 'EEUU',
    level: 68,
    joinedAt: '2025-06-14T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-7',
    gameId: '4820194829',
    nickname: '⚡SPARTA・APOLO',
    phone: '+573102340007',
    rank: 'Miembro',
    role: 'Sniper',
    region: 'EEUU',
    level: 67,
    joinedAt: '2025-07-02T00:00:00.000Z',
  },
  {
    id: 'sparta-mbr-8',
    gameId: '5920194821',
    nickname: '⚡SPARTA・HERMES',
    phone: '+56912340008',
    rank: 'Miembro',
    role: 'Soporte',
    region: 'SUD',
    level: 65,
    joinedAt: '2025-08-19T00:00:00.000Z',
  },
];

export function getClanMembers(): ClanMember[] {
  try {
    const raw = localStorage.getItem(CLAN_MEMBERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(SEED_CLAN_MEMBERS));
      return SEED_CLAN_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_CLAN_MEMBERS;
  } catch (err) {
    console.error('Error reading clan members:', err);
    return SEED_CLAN_MEMBERS;
  }
}

export function saveClanMember(
  data: Omit<ClanMember, 'id' | 'joinedAt'>
): ClanMember {
  const members = getClanMembers();
  const cleanGameId = data.gameId.trim().replace(/\D/g, '');
  const cleanPhone = data.phone.trim().replace(/[\s-]/g, '');

  const newMember: ClanMember = {
    ...data,
    id: `mbr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    gameId: cleanGameId,
    phone: cleanPhone,
    joinedAt: new Date().toISOString(),
  };

  members.unshift(newMember);
  localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(members));
  return newMember;
}

export function updateClanMemberRank(id: string, newRank: ClanRank): void {
  const members = getClanMembers();
  const target = members.find((m) => m.id === id);
  if (target) {
    target.rank = newRank;
    localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(members));
  }
}

const RANK_HIERARCHY: ClanRank[] = ['Miembro', 'Veterano', 'Capitán', 'Colíder', 'Líder'];

export function promoteClanMember(id: string): void {
  const members = getClanMembers();
  const target = members.find((m) => m.id === id);
  if (target) {
    const currentIndex = RANK_HIERARCHY.indexOf(target.rank);
    if (currentIndex >= 0 && currentIndex < RANK_HIERARCHY.length - 1) {
      target.rank = RANK_HIERARCHY[currentIndex + 1];
      localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
  }
}

export function demoteClanMember(id: string): void {
  const members = getClanMembers();
  const target = members.find((m) => m.id === id);
  if (target) {
    const currentIndex = RANK_HIERARCHY.indexOf(target.rank);
    if (currentIndex > 0) {
      target.rank = RANK_HIERARCHY[currentIndex - 1];
      localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(members));
    }
  }
}

export function removeClanMember(id: string): void {
  const members = getClanMembers();
  const filtered = members.filter((m) => m.id !== id);
  localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(filtered));
}

export function getApplicants(): Applicant[] {
  try {
    const raw = localStorage.getItem(APPLICANTS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading applicants from storage:', err);
    return [];
  }
}

export function saveApplicant(data: Omit<Applicant, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Applicant {
  const applicants = getApplicants();
  
  // Clean phone and game ID
  const cleanPhone = data.phone.trim().replace(/[\s-]/g, '');
  const cleanGameId = data.gameId.trim();

  // Check if already applied with this phone or gameId
  const existingIndex = applicants.findIndex(
    (a) =>
      a.gameId.trim() === cleanGameId ||
      a.phone.trim().replace(/[\s-]/g, '') === cleanPhone
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing application
    const existing = applicants[existingIndex];
    const updated: Applicant = {
      ...existing,
      ...data,
      phone: cleanPhone,
      gameId: cleanGameId,
      updatedAt: now,
      // If was rejected, set back to pending for re-evaluation
      status: existing.status === 'rechazado' ? 'pendiente' : existing.status,
    };
    applicants[existingIndex] = updated;
    localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(applicants));
    return updated;
  }

  const newApplicant: Applicant = {
    ...data,
    id: `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    phone: cleanPhone,
    gameId: cleanGameId,
    status: 'pendiente',
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newApplicant, ...applicants];
  localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(updatedList));
  return newApplicant;
}

export function authenticateUser(phoneInput: string, gameIdInput: string): Applicant | null {
  const applicants = getApplicants();
  const cleanPhone = phoneInput.trim().replace(/[\s-]/g, '');
  const cleanGameId = gameIdInput.trim();

  // Match where phone ends with the input numbers or matches exactly, and gameId matches
  const match = applicants.find((app) => {
    const appPhone = app.phone.trim().replace(/[\s-]/g, '');
    const phoneMatches = appPhone === cleanPhone || appPhone.endsWith(cleanPhone) || cleanPhone.endsWith(appPhone);
    const gameIdMatches = app.gameId.trim() === cleanGameId;
    return phoneMatches && gameIdMatches;
  });

  return match || null;
}

export function updateApplicantStatus(
  id: string,
  status: ApplicantStatus,
  staffNotes?: string,
  reviewedBy?: string
): Applicant | null {
  const applicants = getApplicants();
  const index = applicants.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const target = applicants[index];
  const updated: Applicant = {
    ...target,
    status,
    staffNotes: staffNotes !== undefined ? staffNotes : target.staffNotes,
    reviewedBy: reviewedBy || target.reviewedBy || 'Staff Sparta',
    updatedAt: new Date().toISOString(),
  };

  applicants[index] = updated;
  localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(applicants));
  return updated;
}

export function updateApplicantNotes(id: string, notes: string): Applicant | null {
  const applicants = getApplicants();
  const index = applicants.findIndex((a) => a.id === id);
  if (index === -1) return null;

  applicants[index] = {
    ...applicants[index],
    staffNotes: notes,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(applicants));
  return applicants[index];
}

export function deleteApplicant(id: string): boolean {
  const applicants = getApplicants();
  const filtered = applicants.filter((a) => a.id !== id);
  if (filtered.length === applicants.length) return false;

  localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// User Session Management
export function getUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserSession(session: UserSession): void {
  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Error saving user session:', err);
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
  } catch (err) {
    console.error('Error clearing user session:', err);
  }
}

// Staff Session Management
export function isStaffAuthenticated(): boolean {
  try {
    return localStorage.getItem(STAFF_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStaffAuthenticated(isAuth: boolean): void {
  try {
    if (isAuth) {
      localStorage.setItem(STAFF_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(STAFF_AUTH_KEY);
    }
  } catch (err) {
    console.error('Error setting staff auth:', err);
  }
}
