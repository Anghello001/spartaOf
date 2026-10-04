import { GameskinboPlayerData } from '../types';

const STORAGE_KEY_PRIMARY_API = 'sparta_gameskinbo_primary_key';
const STORAGE_KEY_BACKUP_API = 'sparta_gameskinbo_backup_key';
const STORAGE_KEY_ENDPOINT = 'sparta_gameskinbo_endpoint';

export function getGameskinboPrimaryApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_PRIMARY_API) || localStorage.getItem('sparta_gameskinbo_api_key') || '';
  } catch {
    return '';
  }
}

export function saveGameskinboPrimaryApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRIMARY_API, key.trim());
    localStorage.setItem('sparta_gameskinbo_api_key', key.trim());
  } catch (err) {
    console.error('Error saving primary API key:', err);
  }
}

export function getGameskinboBackupApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_BACKUP_API) || '';
  } catch {
    return '';
  }
}

export function saveGameskinboBackupApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_BACKUP_API, key.trim());
  } catch (err) {
    console.error('Error saving backup API key:', err);
  }
}

// Backward compatibility alias
export function getGameskinboApiKey(): string {
  return getGameskinboPrimaryApiKey() || getGameskinboBackupApiKey();
}

export function saveGameskinboApiKey(key: string): void {
  saveGameskinboPrimaryApiKey(key);
}

export function getGameskinboEndpoint(): string {
  try {
    return (
      localStorage.getItem(STORAGE_KEY_ENDPOINT) ||
      'https://api.gameskinbo.com/api/v1/freefire/player'
    );
  } catch {
    return 'https://api.gameskinbo.com/api/v1/freefire/player';
  }
}

export function saveGameskinboEndpoint(endpoint: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENDPOINT, endpoint.trim());
  } catch (err) {
    console.error('Error saving endpoint:', err);
  }
}

// Generate realistic Free Fire profile data deterministically based on player ID
export function generateDeterministicPlayerData(playerId: string, nickname?: string): GameskinboPlayerData {
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash << 5) - hash + playerId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const level = 55 + (absHash % 25); // 55 - 79
  const likes = 1200 + (absHash % 14500);
  const kd = 2.1 + ((absHash % 250) / 100); // 2.1 - 4.6
  const headshot = 32 + (absHash % 42); // 32% - 74%
  const matches = 850 + (absHash % 2600);
  const winRate = 38 + (absHash % 32); // 38% - 70%
  const wins = Math.round((matches * winRate) / 100);

  const ranksBR = [
    'Diamante IV',
    'Heroico 1★',
    'Heroico 3★',
    'Heroico 5★',
    'Maestro',
    'Gran Maestro I',
    'Gran Maestro II',
  ];
  const rankBR = ranksBR[absHash % ranksBR.length];

  const ranksCS = [
    'Heroico 8★',
    'Heroico 15★',
    'Heroico 24★',
    'Maestro',
    'Gran Maestro',
  ];
  const rankCS = ranksCS[(absHash >> 2) % ranksCS.length];

  return {
    playerId,
    nickname: nickname || `Guerrero_${playerId.slice(-4)}`,
    level,
    exp: level * 14200 + (absHash % 8500),
    likes,
    rankBR,
    rankBRScore: 3200 + (absHash % 2800),
    rankCS,
    rankCSStars: 10 + (absHash % 35),
    kdRatio: parseFloat(kd.toFixed(2)),
    headshotRate: headshot,
    matchesPlayed: matches,
    wins,
    winRate,
    guildName: absHash % 3 === 0 ? 'Sin Clan' : 'Espartanos Exilados',
    guildId: absHash % 3 === 0 ? undefined : `${20000000 + (absHash % 999999)}`,
    bio: '¡Pura cabeza! Jugador competitivo buscando clan serio. 1v1 disponible.',
    lastActive: 'Hace 45 minutos',
    isRealApiData: false,
  };
}

async function executeApiCall(
  endpoint: string,
  key: string,
  playerId: string
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  try {
    // 1. Try via Render backend proxy if running
    const envBackend = import.meta.env.VITE_API_URL || '';
    const proxyBase = envBackend ? envBackend.replace(/\/+$/, '') : '';
    const proxyUrl = `${proxyBase}/api/gameskinbo/player?id=${encodeURIComponent(playerId)}&key=${encodeURIComponent(key)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const proxyRes = await fetch(proxyUrl, {
        method: 'GET',
        headers: { Accept: 'application/json', 'X-API-KEY': key },
        signal: controller.signal,
      });
      if (proxyRes.ok) {
        const json = await proxyRes.json();
        if (json.data) {
          clearTimeout(timeoutId);
          return { success: true, data: json.data, status: 200 };
        }
      }
    } catch {
      // Backend proxy unavailable or offline, continue to direct endpoint
    }

    // 2. Direct external fetch
    const url = new URL(endpoint);
    url.searchParams.set('id', playerId);
    url.searchParams.set('key', key);
    url.searchParams.set('apiKey', key);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${key}`,
        'X-API-KEY': key,
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const json = await response.json();
    return { success: true, data: json, status: response.status };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'AbortError' ? 'Tiempo de espera agotado' : err.message || 'Error de red',
    };
  }
}

/**
 * Fetch stats from Gameskinbo with Dual API Failover:
 * 1. Checks Primary API Key first.
 * 2. If Primary fails (quota exceeded 429, 401, timeout, or error), automatically falls back to Backup API Key.
 * 3. Informs user clearly which API key succeeded.
 */
export async function fetchGameskinboStats(
  playerId: string,
  userNickname?: string
): Promise<{
  data: GameskinboPlayerData;
  message: string;
  fromLiveApi: boolean;
  activeKeyType: 'primary' | 'backup' | 'none';
}> {
  const primaryKey = getGameskinboPrimaryApiKey();
  const backupKey = getGameskinboBackupApiKey();
  const endpoint = getGameskinboEndpoint();

  if (!primaryKey && !backupKey) {
    const mock = generateDeterministicPlayerData(playerId, userNickname);
    return {
      data: mock,
      message:
        'Modo Demo: Ninguna API de Gameskinbo configurada aún. Ingresa tu API Primaria y Secundaria en la sección Staff para consultar datos en vivo.',
      fromLiveApi: false,
      activeKeyType: 'none',
    };
  }

  // Attempt 1: Try Primary API Key
  if (primaryKey) {
    const primaryResult = await executeApiCall(endpoint, primaryKey, playerId);
    if (primaryResult.success && primaryResult.data) {
      const json = primaryResult.data;
      return {
        data: parseGameskinboResponse(json, playerId, userNickname),
        message: '✓ Estadísticas obtenidas exitosamente con la API Primaria de Gameskinbo.',
        fromLiveApi: true,
        activeKeyType: 'primary',
      };
    }

    console.warn('Primary Gameskinbo API failed or exhausted:', primaryResult.error);

    // If Primary failed, attempt with Backup Key if available
    if (backupKey) {
      console.info('Switching to Backup Gameskinbo API Key...');
      const backupResult = await executeApiCall(endpoint, backupKey, playerId);
      if (backupResult.success && backupResult.data) {
        return {
          data: parseGameskinboResponse(backupResult.data, playerId, userNickname),
          message:
            '⚡ API Primaria agotada o con error. Se utilizó automáticamente la API Secundaria (Respaldo) con éxito.',
          fromLiveApi: true,
          activeKeyType: 'backup',
        };
      }
    }
  } else if (backupKey) {
    // Only Backup key exists
    const backupResult = await executeApiCall(endpoint, backupKey, playerId);
    if (backupResult.success && backupResult.data) {
      return {
        data: parseGameskinboResponse(backupResult.data, playerId, userNickname),
        message: '✓ Estadísticas obtenidas con la API Secundaria (Respaldo).',
        fromLiveApi: true,
        activeKeyType: 'backup',
      };
    }
  }

  // Fallback to simulated profile if both network calls fail
  const fallback = generateDeterministicPlayerData(playerId, userNickname);
  return {
    data: fallback,
    message:
      'No se pudo conectar con las APIs configuradas (posible cuota agotada o restricción CORS). Mostrando estimación basada en ID.',
    fromLiveApi: false,
    activeKeyType: 'none',
  };
}

function parseGameskinboResponse(json: any, playerId: string, userNickname?: string): GameskinboPlayerData {
  return {
    playerId: json.player_id || json.id || json.account_id || playerId,
    nickname: json.nickname || json.name || userNickname || `Player_${playerId}`,
    level: Number(json.level || json.account_level || 65),
    exp: Number(json.exp || json.experience || 540000),
    likes: Number(json.likes || json.popularity || 2500),
    rankBR: json.br_rank || json.rank || json.ranking || 'Heroico',
    rankBRScore: Number(json.br_score || json.ranking_points || 3600),
    rankCS: json.cs_rank || json.clash_squad_rank || 'Heroico 12★',
    rankCSStars: Number(json.cs_stars || 12),
    kdRatio: parseFloat(Number(json.kd || json.kd_ratio || 2.85).toFixed(2)),
    headshotRate: Number(json.headshot_rate || json.hs_rate || 46),
    matchesPlayed: Number(json.matches || json.total_matches || 1200),
    wins: Number(json.wins || 520),
    winRate: Number(json.win_rate || 43),
    guildName: json.guild_name || json.clan_name || undefined,
    guildId: json.guild_id || undefined,
    avatarUrl: json.avatar || json.icon,
    bio: json.bio || json.signature,
    lastActive: json.last_online || 'Reciente',
    isRealApiData: true,
    rawResponse: json,
  };
}
