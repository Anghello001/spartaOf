import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Configuración de almacenamiento persistente centralizado en el servidor
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'sparta_store.json');

// Configuración de CORS total: permite que cualquier origen (como Vercel o el móvil de un amigo) envíe datos sin bloqueos
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-KEY',
      'X-BACKUP-KEY',
      'X-LEADER-PASSWORD',
    ],
  })
);

app.use(express.json());

// ==========================================
// SEGURIDAD DE LÍDERES: Contraseña Secreta
// ==========================================
const CONTRASEÑA_LIDER = process.env.LEADER_PASSWORD || 'MiClanFF2026*';
const VALID_PASSWORDS = [CONTRASEÑA_LIDER, 'MiClanFF2026*', 'sparta001oficial'];

function isAuthorizedLeader(req: Request): boolean {
  const bodyPassword = req.body?.password;
  const headerPassword =
    (req.headers['x-leader-password'] as string) ||
    (req.headers['authorization']?.replace(/^Bearer\s+/i, ''));
  const queryPassword = req.query?.password as string;

  const provided = bodyPassword || headerPassword || queryPassword;
  return Boolean(provided && VALID_PASSWORDS.includes(provided));
}

// In-memory applicants store
interface ServerApplicant {
  id: string;
  gameId: string;
  nickname: string;
  phone: string;
  region: string;
  role: string;
  level: number;
  device?: string;
  micAvailable?: boolean;
  schedule?: string;
  reason?: string;
  status: 'pendiente' | 'en_prueba' | 'aceptado' | 'rechazado';
  staffNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServerClanMember {
  id: string;
  gameId: string;
  nickname: string;
  phone: string;
  rank: 'Líder' | 'Colíder' | 'Capitán' | 'Veterano' | 'Miembro';
  role: string;
  region: string;
  level: number;
  joinedAt: string;
}

let serverApplicantsStore: ServerApplicant[] = [];
let serverClanMembersStore: ServerClanMember[] = [
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
];

// Funciones de sincronización persistente centralizada (sin almacenamiento local de cliente)
function loadServerStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.applicants)) {
        serverApplicantsStore = data.applicants;
      }
      if (Array.isArray(data.members) && data.members.length > 0) {
        serverClanMembersStore = data.members;
      }
      console.log(`[Storage] Base centralizada cargada: ${serverApplicantsStore.length} solicitudes, ${serverClanMembersStore.length} miembros.`);
    }
  } catch (err) {
    console.warn('[Storage] Aviso: usando base en memoria:', err);
  }
}

function saveServerStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        {
          applicants: serverApplicantsStore,
          members: serverClanMembersStore,
          lastUpdated: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.warn('[Storage] Error al persistir datos centrales:', err);
  }
}

loadServerStore();

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    clan: 'OF SPARTA',
    platform: 'Render + Vercel Architecture',
    uptimeSeconds: Math.floor(process.uptime()),
    applicantsCount: serverApplicantsStore.length,
    membersCount: serverClanMembersStore.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * ========================================================
 * RUTAS PROTEGIDAS PARA LÍDERES (CON CONTRASEÑA OBLIGATORIA)
 * ========================================================
 */

// 1. RUTA PARA LOGIN DE LÍDERES
app.post('/api/lideres/login', (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'Contraseña incorrecta. Acceso denegado.' });
    return;
  }

  res.status(200).json({
    success: true,
    mensaje: 'Acceso autorizado al panel de líderes de OF SPARTA.',
    token: 'auth-leader-granted',
  });
});

// 2. RUTA PARA VER LOS REGISTRADOS Y MIEMBROS (Solo con contraseña)
app.post('/api/lideres/ver-todos', async (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'Contraseña incorrecta. Acceso denegado.' });
    return;
  }

  res.status(200).json({
    success: true,
    totalReclutas: serverApplicantsStore.length,
    totalMiembros: serverClanMembersStore.length,
    reclutas: serverApplicantsStore,
    miembros: serverClanMembersStore,
  });
});

// 3. RUTA PARA BOTAR / ELIMINAR A ALGUIEN (Solo con contraseña)
const handleBotar = async (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'No tienes permiso para hacer esto.' });
    return;
  }

  const { id } = req.params;

  // Check if it's an applicant
  const applicantIndex = serverApplicantsStore.findIndex((a) => a.id === id);
  if (applicantIndex >= 0) {
    const deleted = serverApplicantsStore.splice(applicantIndex, 1);
    saveServerStore();
    res.status(200).json({
      success: true,
      mensaje: 'Jugador rechazado y eliminado de la lista de postulaciones.',
      eliminado: deleted[0],
    });
    return;
  }

  // Check if it's a clan member
  const memberIndex = serverClanMembersStore.findIndex((m) => m.id === id);
  if (memberIndex >= 0) {
    const kicked = serverClanMembersStore.splice(memberIndex, 1);
    saveServerStore();
    res.status(200).json({
      success: true,
      mensaje: 'Miembro botado y eliminado del clan OF SPARTA.',
      eliminado: kicked[0],
    });
    return;
  }

  res.status(404).json({ error: 'Registro no encontrado en el servidor.' });
};

// Accept both DELETE and POST for maximum proxy/client compatibility
app.delete('/api/lideres/botar/:id', handleBotar);
app.post('/api/lideres/botar/:id', handleBotar);

// 4. RUTA PARA PROMOVER O DEGRADAR MIEMBRO
app.post('/api/lideres/cambiar-rango/:id', (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'No tienes permiso para hacer esto.' });
    return;
  }

  const { id } = req.params;
  const { rank } = req.body;

  const member = serverClanMembersStore.find((m) => m.id === id);
  if (!member) {
    res.status(404).json({ error: 'Miembro no encontrado.' });
    return;
  }

  if (rank) {
    member.rank = rank;
  }

  saveServerStore();
  res.status(200).json({ success: true, member });
});

// 5. RUTA PARA AGREGAR MIEMBRO MANUAL
app.post('/api/lideres/agregar-miembro', (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'No tienes permiso para hacer esto.' });
    return;
  }

  const { gameId, nickname, phone, rank, role, region, level } = req.body;
  if (!gameId || !nickname || !phone) {
    res.status(400).json({ error: 'Faltan campos obligatorios (ID, Nickname, WhatsApp).' });
    return;
  }

  const newMember: ServerClanMember = {
    id: `sparta-mbr-${Date.now()}`,
    gameId: gameId.toString().trim(),
    nickname: nickname.toString().trim(),
    phone: phone.toString().trim(),
    rank: rank || 'Miembro',
    role: role || 'Rusher',
    region: region || 'EEUU',
    level: Number(level) || 65,
    joinedAt: new Date().toISOString(),
  };

  serverClanMembersStore.unshift(newMember);
  saveServerStore();
  res.status(200).json({ success: true, member: newMember });
});

// 6. RUTA PARA ACEPTAR A UN RECLUTA EN EL CLAN
// REGLA CRÍTICA: Al aceptar a alguien en el clan, su solicitud YA NO SE REFLEJA (se elimina de solicitudes)
app.post('/api/lideres/aceptar-recluta/:id', (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'No tienes permiso para hacer esto.' });
    return;
  }

  const { id } = req.params;
  const applicantIndex = serverApplicantsStore.findIndex((a) => a.id === id);

  if (applicantIndex === -1) {
    res.status(404).json({ error: 'Solicitud de recluta no encontrada en el servidor.' });
    return;
  }

  const applicant = serverApplicantsStore[applicantIndex];
  const cleanNick = applicant.nickname.startsWith('⚡SPARTA・')
    ? applicant.nickname
    : `⚡SPARTA・${applicant.nickname}`;

  // Verificar si ya existe en miembros
  const existingMemberIndex = serverClanMembersStore.findIndex(
    (m) => m.gameId === applicant.gameId
  );

  let member: ServerClanMember;
  if (existingMemberIndex >= 0) {
    member = serverClanMembersStore[existingMemberIndex];
  } else {
    member = {
      id: `sparta-mbr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      gameId: applicant.gameId,
      nickname: cleanNick,
      phone: applicant.phone,
      rank: 'Miembro',
      role: applicant.role || 'Rusher',
      region: applicant.region || 'EEUU',
      level: applicant.level || 65,
      joinedAt: new Date().toISOString(),
    };
    serverClanMembersStore.unshift(member);
  }

  // Eliminar inmediatamente de la lista de solicitudes para que ya NO se refleje
  serverApplicantsStore.splice(applicantIndex, 1);
  saveServerStore();

  res.status(200).json({
    success: true,
    mensaje: `¡${applicant.nickname} ha sido aceptado oficialmente en el Clan OF SPARTA! Su solicitud ya no se refleja en peticiones.`,
    member,
  });
});

// 7. RUTA PARA CAMBIAR ESTADO DE SOLICITUD (En prueba, notas, o aceptación)
app.post('/api/lideres/cambiar-estado/:id', (req: Request, res: Response) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: 'No tienes permiso para hacer esto.' });
    return;
  }

  const { id } = req.params;
  const { status, staffNotes } = req.body;

  const applicantIndex = serverApplicantsStore.findIndex((a) => a.id === id);

  if (applicantIndex === -1) {
    res.status(404).json({ error: 'Solicitud no encontrada.' });
    return;
  }

  // Si se cambia el estado a 'aceptado', se traslada a miembros y se remueve de solicitudes
  if (status === 'aceptado') {
    const applicant = serverApplicantsStore[applicantIndex];
    const cleanNick = applicant.nickname.startsWith('⚡SPARTA・')
      ? applicant.nickname
      : `⚡SPARTA・${applicant.nickname}`;

    const newMember: ServerClanMember = {
      id: `sparta-mbr-${Date.now()}`,
      gameId: applicant.gameId,
      nickname: cleanNick,
      phone: applicant.phone,
      rank: 'Miembro',
      role: applicant.role || 'Rusher',
      region: applicant.region || 'EEUU',
      level: applicant.level || 65,
      joinedAt: new Date().toISOString(),
    };
    serverClanMembersStore.unshift(newMember);
    serverApplicantsStore.splice(applicantIndex, 1);
    saveServerStore();

    res.status(200).json({
      success: true,
      mensaje: 'Recluta aceptado. La solicitud ha sido promovida a Miembro y ya no se refleja en peticiones.',
      member: newMember,
    });
    return;
  }

  const applicant = serverApplicantsStore[applicantIndex];
  if (status) applicant.status = status;
  if (staffNotes !== undefined) applicant.staffNotes = staffNotes;
  applicant.updatedAt = new Date().toISOString();

  saveServerStore();
  res.status(200).json({ success: true, applicant });
});

/**
 * ========================================================
 * RUTAS PÚBLICAS: Reclutamiento, Consulta y Gameskinbo
 * ========================================================
 */

// 8. RUTA PÚBLICA PARA VER LA ALINEACIÓN DEL CLAN (Para que todos los dispositivos vean los mismos miembros)
app.get('/api/miembros-publicos', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    total: serverClanMembersStore.length,
    members: serverClanMembersStore,
  });
});

// 9. RUTA PÚBLICA PARA CONSULTAR ESTADO DIRECTAMENTE EN EL SERVIDOR (Sin localStorage)
app.post('/api/consultar-estado', (req: Request, res: Response) => {
  const { phone, gameId } = req.body;
  const cleanPhone = (phone || '').toString().trim().replace(/[\s-]/g, '');
  const cleanGameId = (gameId || '').toString().trim().replace(/\D/g, '');

  if (!cleanPhone || !cleanGameId) {
    res.status(400).json({
      success: false,
      error: 'Debes proporcionar tu número de celular y tu ID de Free Fire.',
    });
    return;
  }

  // 1. Verificar si ya fue aceptado como miembro oficial
  const member = serverClanMembersStore.find((m) => {
    const mPhone = m.phone.replace(/[\s-]/g, '');
    const phoneMatch =
      mPhone === cleanPhone || mPhone.endsWith(cleanPhone) || cleanPhone.endsWith(mPhone);
    const idMatch = m.gameId === cleanGameId;
    return phoneMatch && idMatch;
  });

  if (member) {
    res.status(200).json({
      success: true,
      isMember: true,
      status: 'aceptado',
      member,
      applicant: {
        id: member.id,
        gameId: member.gameId,
        nickname: member.nickname,
        phone: member.phone,
        region: member.region,
        role: member.role,
        level: member.level,
        status: 'aceptado',
        createdAt: member.joinedAt,
        updatedAt: member.joinedAt,
      },
      mensaje: '¡Eres miembro oficial del Clan OF SPARTA!',
    });
    return;
  }

  // 2. Verificar si está en la lista de solicitudes pendientes o en prueba
  const applicant = serverApplicantsStore.find((a) => {
    const aPhone = a.phone.replace(/[\s-]/g, '');
    const phoneMatch =
      aPhone === cleanPhone || aPhone.endsWith(cleanPhone) || cleanPhone.endsWith(aPhone);
    const idMatch = a.gameId === cleanGameId;
    return phoneMatch && idMatch;
  });

  if (applicant) {
    res.status(200).json({
      success: true,
      isMember: false,
      status: applicant.status,
      applicant,
    });
    return;
  }

  res.status(404).json({
    success: false,
    error:
      'No se encontró ninguna postulación con este número de celular e ID en el servidor. Verifica los datos o envía una solicitud nueva.',
  });
});

// Endpoint de Reclutamiento
app.post('/api/reclutar', async (req: Request, res: Response) => {
  const {
    uid,
    gameId,
    nombre,
    nickname,
    telefono,
    phone,
    rol,
    region,
    rango,
    nivel,
    device,
    micAvailable,
    reason,
  } = req.body;

  const resolvedGameId = (uid || gameId || '').toString().trim();
  const resolvedNick = (nombre || nickname || '').toString().trim();
  const resolvedPhone = (telefono || phone || '').toString().trim().replace(/[\s-]/g, '');

  if (!resolvedGameId || !resolvedNick || !resolvedPhone) {
    res.status(400).json({
      success: false,
      error: 'Campos obligatorios incompletos: Se requiere ID de Free Fire, Nickname y Teléfono de WhatsApp.',
    });
    return;
  }

  const now = new Date().toISOString();
  const newApplicant: ServerApplicant = {
    id: `sparta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gameId: resolvedGameId,
    nickname: resolvedNick,
    phone: resolvedPhone,
    region: region || 'EEUU',
    role: rol || 'Rusher',
    level: Number(nivel) || 65,
    device: device || 'Móvil',
    micAvailable: micAvailable !== undefined ? Boolean(micAvailable) : true,
    reason: reason || `Rango: ${rango || 'Heroico'}. Postulación directa enviada al clan OF SPARTA.`,
    status: 'pendiente',
    createdAt: now,
    updatedAt: now,
  };

  const existingIdx = serverApplicantsStore.findIndex(
    (a) => a.gameId === resolvedGameId || a.phone === resolvedPhone
  );

  if (existingIdx >= 0) {
    serverApplicantsStore[existingIdx] = {
      ...serverApplicantsStore[existingIdx],
      ...newApplicant,
      id: serverApplicantsStore[existingIdx].id,
      createdAt: serverApplicantsStore[existingIdx].createdAt,
    };
  } else {
    serverApplicantsStore.unshift(newApplicant);
  }
  saveServerStore();

  // Webhook Make.com para WhatsApp
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  let webhookTriggered = false;

  if (webhookUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clan: 'OF SPARTA',
          evento: 'NUEVA_POSTULACION',
          uid: resolvedGameId,
          nombre: resolvedNick,
          telefono: resolvedPhone,
          rol: newApplicant.role,
          region: newApplicant.region,
          mensajeWhatsApp: `¡Hola ${resolvedNick}! Tu solicitud para entrar a OF SPARTA (ID ${resolvedGameId}) ha sido recibida con éxito por los moderadores.`,
          timestamp: now,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      webhookTriggered = true;
    } catch (err: any) {
      console.warn('[Webhook] No se pudo enviar alerta a Make.com:', err.message);
    }
  }

  const welcomeText = encodeURIComponent(
    `⚔️ Hola ${resolvedNick}, recibimos tu postulación para el Clan OF SPARTA (ID ${resolvedGameId}). En breve un moderador revisará tus estadísticas.`
  );
  const directWhatsAppUrl = `https://wa.me/${resolvedPhone.replace(/\D/g, '')}?text=${welcomeText}`;

  res.status(200).json({
    success: true,
    mensaje: '¡Petición enviada con éxito! Cuenta creada en OF SPARTA.',
    applicant: newApplicant,
    webhookTriggered,
    directWhatsAppUrl,
  });
});

// Proxy Gameskinbo con Dual API
app.get('/api/gameskinbo/player', async (req: Request, res: Response) => {
  const playerId = (req.query.id as string) || '';
  const primaryKey =
    (req.headers['x-api-key'] as string) ||
    (req.query.key as string) ||
    process.env.FREE_FIRE_API_KEY ||
    '';
  const backupKey =
    (req.headers['x-backup-key'] as string) ||
    (req.query.backupKey as string) ||
    process.env.FREE_FIRE_BACKUP_API_KEY ||
    '';
  const endpoint =
    (req.query.endpoint as string) || 'https://api.gameskinbo.com/api/v1/freefire/player';

  if (!playerId) {
    res.status(400).json({ error: 'Falta el ID del jugador.' });
    return;
  }

  const callExternalApi = async (key: string) => {
    const url = new URL(endpoint);
    url.searchParams.set('id', playerId);
    url.searchParams.set('key', key);
    url.searchParams.set('apiKey', key);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  if (primaryKey) {
    try {
      const data = await callExternalApi(primaryKey);
      res.status(200).json({ success: true, source: 'primary', data });
      return;
    } catch (err: any) {
      console.warn('API Primaria falló en servidor Render, intentando API Secundaria:', err.message);
    }
  }

  if (backupKey) {
    try {
      const data = await callExternalApi(backupKey);
      res.status(200).json({
        success: true,
        source: 'backup',
        message: 'Conmutado a API Secundaria por límite de cuota.',
        data,
      });
      return;
    } catch (err: any) {
      console.warn('API Secundaria también falló:', err.message);
    }
  }

  res.status(503).json({
    success: false,
    message: 'APIs no disponibles o claves no configuradas en Render.',
  });
});

// En producción sirve los archivos estáticos de Vite en dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[OF SPARTA Backend] Escuchando en el puerto ${PORT}`);
  console.log(`[OF SPARTA Backend] Health check listo en /api/health`);
  console.log(`[OF SPARTA Backend] Rutas de líderes protegidas con contraseña`);
});
