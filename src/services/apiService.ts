import { Applicant } from '../types';

/**
 * Obtiene la URL base del Backend en Render configurada en Vercel
 * a través de la variable de entorno VITE_API_URL.
 */
export function getBackendUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return '';
}

export interface RecruitPayload {
  uid: string;
  gameId?: string;
  nombre: string;
  nickname?: string;
  telefono: string;
  phone?: string;
  rango?: string;
  rol?: string;
  region?: string;
  nivel?: number;
  reason?: string;
}

/**
 * Envía la postulación desde Vercel (Frontend) a Render (Backend)
 */
export async function sendRecruitToBackend(
  data: RecruitPayload
): Promise<{ success: boolean; applicant?: any; error?: string; directWhatsAppUrl?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/reclutar` : '/api/reclutar';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.error || `Error del servidor HTTP ${response.status}`,
      };
    }

    const resJson = await response.json();
    return {
      success: true,
      applicant: resJson.applicant,
      directWhatsAppUrl: resJson.directWhatsAppUrl,
    };
  } catch (err: any) {
    console.warn('[Vercel -> Render] Conexión al backend en espera o modo offline:', err.message);
    return {
      success: false,
      error:
        err.name === 'AbortError'
          ? 'El servidor backend en Render está despertando (~50s). Tus datos han sido guardados localmente.'
          : 'Modo autónomo: guardado en almacenamiento del navegador.',
    };
  }
}

/**
 * RUTAS DE LÍDERES CON CONTRASEÑA EN RENDER:
 */

// 1. Validar Contraseña de Líder
export async function verifyLeaderPassword(
  password: string
): Promise<{ success: boolean; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/login` : '/api/lideres/login';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Contraseña incorrecta. Acceso denegado.' };
    }

    return { success: true };
  } catch (err: any) {
    // If backend is waking up or in standalone preview, client will fallback
    return { success: false, error: err.message };
  }
}

// 2. Cargar todas las solicitudes y miembros desde Render usando la contraseña
export async function fetchLeaderAll(
  password: string
): Promise<{ success: boolean; reclutas?: any[]; miembros?: any[]; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/ver-todos` : '/api/lideres/ver-todos';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Contraseña incorrecta. Acceso denegado.' };
    }

    const data = await res.json();
    return {
      success: true,
      reclutas: data.reclutas || [],
      miembros: data.miembros || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 3. Botar / Eliminar jugador con contraseña en Render
export async function botarJugadorBackend(
  id: string,
  password: string
): Promise<{ success: boolean; mensaje?: string; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/botar/${id}` : `/api/lideres/botar/${id}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST', // Usamos POST para garantizar compatibilidad con body
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'No tienes permiso para hacer esto.' };
    }

    const data = await res.json();
    return { success: true, mensaje: data.mensaje || 'Jugador rechazado y eliminado de la lista.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Comprueba el estado del servidor en Render
 */
export async function checkBackendHealth(): Promise<{
  online: boolean;
  uptimeSeconds?: number;
  platform?: string;
}> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/health` : '/api/health';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, { signal: controller.signal }).finally(() =>
      clearTimeout(timeoutId)
    );

    if (res.ok) {
      const json = await res.json();
      return { online: true, uptimeSeconds: json.uptimeSeconds, platform: json.platform };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}
