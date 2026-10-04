import { Applicant, ApplicantStatus, UserSession, ClanMember, ClanRank } from '../types';

const APPLICANTS_STORAGE_KEY = 'sparta_clan_applicants_v3';
const CLAN_MEMBERS_STORAGE_KEY = 'sparta_clan_members_v3';
const USER_SESSION_KEY = 'sparta_user_session';
const STAFF_AUTH_KEY = 'sparta_staff_authenticated';

// Registro limpio de miembros oficiales (sin nombres ficticios)
const SEED_CLAN_MEMBERS: ClanMember[] = [];

export function getClanMembers(): ClanMember[] {
  try {
    const raw = localStorage.getItem(CLAN_MEMBERS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading clan members:', err);
    return [];
  }
}

export function saveClanMember(
  data: Partial<ClanMember> & { gameId: string; nickname: string; phone: string }
): ClanMember {
  const members = getClanMembers();
  const cleanGameId = data.gameId.trim().replace(/\D/g, '');
  const cleanPhone = data.phone.trim().replace(/[\s-]/g, '');

  const existingIdx = members.findIndex(
    (m) => m.gameId.trim().replace(/\D/g, '') === cleanGameId
  );

  const memberObj: ClanMember = {
    id: data.id || `mbr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    gameId: cleanGameId,
    nickname: data.nickname,
    phone: cleanPhone,
    rank: data.rank || 'Miembro',
    role: data.role || 'Rusher',
    region: data.region || 'EEUU',
    level: data.level || 65,
    joinedAt: data.joinedAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    members[existingIdx] = { ...members[existingIdx], ...memberObj };
  } else {
    members.unshift(memberObj);
  }

  localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(members));
  return memberObj;
}

export function saveClanMembersBulk(newMembers: ClanMember[]): void {
  try {
    if (Array.isArray(newMembers)) {
      localStorage.setItem(CLAN_MEMBERS_STORAGE_KEY, JSON.stringify(newMembers));
    }
  } catch (err) {
    console.error('Error saving members in bulk:', err);
  }
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
