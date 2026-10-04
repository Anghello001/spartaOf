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

// 4. Aceptar Recluta en el Servidor (se traslada a miembros y SE ELIMINA de peticiones)
export async function acceptRecruitBackend(
  id: string,
  password: string
): Promise<{ success: boolean; member?: any; mensaje?: string; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/aceptar-recluta/${id}` : `/api/lideres/aceptar-recluta/${id}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al aceptar al recluta en el servidor.' };
    }

    const data = await res.json();
    return {
      success: true,
      member: data.member,
      mensaje: data.mensaje,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 5. Cambiar Estado en el Servidor (en_prueba, notas, etc.)
export async function changeRecruitStatusBackend(
  id: string,
  status: string,
  password: string,
  staffNotes?: string
): Promise<{ success: boolean; applicant?: any; member?: any; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/cambiar-estado/${id}` : `/api/lideres/cambiar-estado/${id}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ password, status, staffNotes }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al actualizar estado en el servidor.' };
    }

    const data = await res.json();
    return {
      success: true,
      applicant: data.applicant,
      member: data.member,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 6. Consultar Estado Directamente al Servidor Central (Sin localStorage en cliente)
export async function queryApplicantStatusBackend(
  phone: string,
  gameId: string
): Promise<{ success: boolean; applicant?: any; isMember?: boolean; member?: any; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/consultar-estado` : '/api/consultar-estado';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, gameId }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err.error || 'No se encontró tu solicitud en el servidor central.',
      };
    }

    const data = await res.json();
    return {
      success: true,
      applicant: data.applicant,
      isMember: data.isMember,
      member: data.member,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 7. Cargar Miembros Públicos del Servidor (Para que todos los dispositivos vean los mismos miembros)
export async function fetchPublicClanMembers(): Promise<{ success: boolean; members?: any[]; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/miembros-publicos` : '/api/miembros-publicos';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(endpoint, { signal: controller.signal }).finally(() =>
      clearTimeout(timeoutId)
    );

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, members: data.members || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 8. Agregar Miembro Manual en el Servidor
export async function agregarMiembroBackend(
  data: any,
  password: string
): Promise<{ success: boolean; member?: any; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/agregar-miembro` : '/api/lideres/agregar-miembro';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ ...data, password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al agregar miembro en el servidor.' };
    }

    const resJson = await res.json();
    return { success: true, member: resJson.member };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 9. Cambiar Rango en el Servidor
export async function cambiarRangoBackend(
  id: string,
  rank: string,
  password: string
): Promise<{ success: boolean; member?: any; error?: string }> {
  const backendUrl = getBackendUrl();
  const endpoint = backendUrl ? `${backendUrl}/api/lideres/cambiar-rango/${id}` : `/api/lideres/cambiar-rango/${id}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ rank, password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al cambiar rango en el servidor.' };
    }

    const resJson = await res.json();
    return { success: true, member: resJson.member };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 10. Guardar y Sincronizar Claves API de Gameskinbo en el Servidor (Para todos los dispositivos)
export async function saveApiKeysBackend(
  primaryKey: string,
  backupKey: string,
  password: string,
  endpoint?: string
): Promise<{ success: boolean; mensaje?: string; error?: string }> {
  const backendUrl = getBackendUrl();
  const targetEndpoint = backendUrl ? `${backendUrl}/api/lideres/guardar-api-keys` : '/api/lideres/guardar-api-keys';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ primaryKey, backupKey, endpoint, password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al guardar claves en el servidor.' };
    }

    const data = await res.json();
    return { success: true, mensaje: data.mensaje };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 11. Obtener Claves API de Gameskinbo del Servidor
export async function fetchApiKeysBackend(
  password: string
): Promise<{ success: boolean; apiConfig?: { primaryKey: string; backupKey: string; endpoint: string }; error?: string }> {
  const backendUrl = getBackendUrl();
  const targetEndpoint = backendUrl ? `${backendUrl}/api/lideres/obtener-api-keys` : '/api/lideres/obtener-api-keys';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LEADER-PASSWORD': password,
      },
      body: JSON.stringify({ password }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Error al obtener claves del servidor.' };
    }

    const data = await res.json();
    return { success: true, apiConfig: data.apiConfig };
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
