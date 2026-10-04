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
 * 1. Checks Primary API Key first through backend proxy (or direct).
 * 2. If Primary fails (quota 429, 401, timeout, etc.), automatically switches to Backup API Key.
 * 3. Works seamlessly on any device (Mobile, Desktop, Tablet).
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
  const cleanId = playerId.trim().replace(/\D/g, '');
  const primaryKey = getGameskinboPrimaryApiKey();
  const backupKey = getGameskinboBackupApiKey();
  const endpoint = getGameskinboEndpoint();

  // 1. Intentar a través del proxy del backend (sincronizado con MongoDB y claves centrales)
  const envBackend = import.meta.env.VITE_API_URL || '';
  const proxyBase = envBackend ? envBackend.replace(/\/+$/, '') : '';
  const proxyUrl = `${proxyBase}/api/gameskinbo/player?id=${encodeURIComponent(cleanId)}&key=${encodeURIComponent(primaryKey)}&backupKey=${encodeURIComponent(backupKey)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-KEY': primaryKey,
        'X-BACKUP-KEY': backupKey,
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const isGenerated = json.data.is_generated || json.source === 'fallback';
        const parsed = parseGameskinboResponse(json.data, cleanId, userNickname);
        parsed.isRealApiData = !isGenerated;

        if (json.source === 'primary') {
          return {
            data: parsed,
            message: '✓ Estadísticas en vivo obtenidas con API Primaria de Gameskinbo.',
            fromLiveApi: true,
            activeKeyType: 'primary',
          };
        } else if (json.source === 'backup') {
          return {
            data: parsed,
            message: '⚡ API Primaria conmutada automáticamente a API Secundaria (Respaldo) con éxito.',
            fromLiveApi: true,
            activeKeyType: 'backup',
          };
        } else {
          return {
            data: parsed,
            message: json.message || 'Estadísticas del jugador listas para evaluación.',
            fromLiveApi: false,
            activeKeyType: 'none',
          };
        }
      }
    }
  } catch (err: any) {
    console.info('[Gameskinbo Client] Proxy no respondió, intentando conexión directa:', err.message);
  }

  // 2. Fallback de llamada directa desde el cliente si el proxy no estuviera disponible
  if (primaryKey) {
    const primaryResult = await executeApiCall(endpoint, primaryKey, cleanId);
    if (primaryResult.success && primaryResult.data) {
      return {
        data: parseGameskinboResponse(primaryResult.data, cleanId, userNickname),
        message: '✓ Estadísticas obtenidas exitosamente con la API Primaria de Gameskinbo.',
        fromLiveApi: true,
        activeKeyType: 'primary',
      };
    }
  }

  if (backupKey) {
    const backupResult = await executeApiCall(endpoint, backupKey, cleanId);
    if (backupResult.success && backupResult.data) {
      return {
        data: parseGameskinboResponse(backupResult.data, cleanId, userNickname),
        message: '⚡ Estadísticas obtenidas con la API Secundaria (Respaldo).',
        fromLiveApi: true,
        activeKeyType: 'backup',
      };
    }
  }

  // 3. Fallback determinista garantizado
  const fallback = generateDeterministicPlayerData(cleanId, userNickname);
  return {
    data: fallback,
    message: primaryKey || backupKey
      ? 'Respuesta rápida de contingencia: Estadísticas estimadas según el ID de Free Fire.'
      : 'Modo autónomo: Ingresa tus claves en el Panel de Líderes para consultar datos en vivo.',
    fromLiveApi: false,
    activeKeyType: 'none',
  };
}

function parseGameskinboResponse(raw: any, playerId: string, userNickname?: string): GameskinboPlayerData {
  const json = raw.data || raw.player || raw.basicInfo || raw.AccountInfo || raw;
  const stats = raw.stats || raw.rank || raw.AccountProfileInfo || json.stats || {};
  const guild = raw.guild || raw.clan || raw.GuildInfo || json.guild || {};

  const nickname =
    json.nickname ||
    json.name ||
    json.Nickname ||
    json.player_name ||
    userNickname ||
    `Player_${playerId}`;

  const level = Number(json.level || json.Level || json.account_level || stats.level || 65);
  const exp = Number(json.exp || json.Exp || json.experience || 540000);
  const likes = Number(json.likes || json.Likes || json.popularity || 2500);

  const rankBR =
    json.br_rank ||
    json.rank ||
    stats.br_rank ||
    stats.Rank ||
    json.ranking ||
    'Heroico';

  const rankBRScore = Number(json.br_score || stats.br_score || stats.RankingPoints || 3600);

  const rankCS =
    json.cs_rank ||
    stats.cs_rank ||
    json.clash_squad_rank ||
    'Heroico 12★';

  const rankCSStars = Number(json.cs_stars || stats.cs_stars || 12);

  const kdRatio = parseFloat(
    Number(json.kd || json.kd_ratio || stats.kd || stats.kd_ratio || 2.85).toFixed(2)
  );

  const headshotRate = Number(
    json.headshot_rate || json.hs_rate || stats.headshot_rate || stats.hs_rate || 46
  );

  const matchesPlayed = Number(
    json.matches || json.total_matches || stats.matches || stats.total_matches || 1200
  );

  const wins = Number(json.wins || stats.wins || Math.round(matchesPlayed * 0.43));
  const winRate = Number(json.win_rate || stats.win_rate || Math.round((wins / (matchesPlayed || 1)) * 100));

  const guildName =
    guild.guild_name ||
    guild.clan_name ||
    guild.GuildName ||
    guild.name ||
    json.guild_name ||
    json.clan_name ||
    undefined;

  const guildId =
    guild.guild_id ||
    guild.GuildID ||
    guild.id ||
    json.guild_id ||
    undefined;

  const bio = json.bio || json.signature || json.Bio || json.Signature || undefined;
  const avatarUrl = json.avatar || json.icon || json.Avatar || json.Icon || undefined;

  return {
    playerId: json.player_id || json.id || json.account_id || playerId,
    nickname,
    level,
    exp,
    likes,
    rankBR,
    rankBRScore,
    rankCS,
    rankCSStars,
    kdRatio,
    headshotRate,
    matchesPlayed,
    wins,
    winRate,
    guildName,
    guildId,
    avatarUrl,
    bio,
    lastActive: json.last_online || json.lastActive || 'Reciente',
    isRealApiData: true,
    rawResponse: raw,
  };
}
