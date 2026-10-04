// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 1e4;
var DATA_DIR = path.resolve(process.cwd(), "data");
var DATA_FILE = path.join(DATA_DIR, "sparta_store.json");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "X-API-KEY",
      "X-BACKUP-KEY",
      "X-LEADER-PASSWORD"
    ]
  })
);
app.use(express.json());
var CONTRASE\u00D1A_LIDER = process.env.LEADER_PASSWORD || "MiClanFF2026*";
var VALID_PASSWORDS = [CONTRASE\u00D1A_LIDER, "MiClanFF2026*", "sparta001oficial"];
function isAuthorizedLeader(req) {
  const bodyPassword = req.body?.password;
  const headerPassword = req.headers["x-leader-password"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  const queryPassword = req.query?.password;
  const provided = bodyPassword || headerPassword || queryPassword;
  return Boolean(provided && VALID_PASSWORDS.includes(provided));
}
var serverApplicantsStore = [];
var serverClanMembersStore = [];
var serverApiConfig = {
  primaryKey: process.env.FREE_FIRE_API_KEY || "",
  backupKey: process.env.FREE_FIRE_BACKUP_API_KEY || "",
  endpoint: "https://api.gameskinbo.com/api/v1/freefire/player"
};
var MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "";
var mongoClient = null;
var mongoDb = null;
var solicitudesCol = null;
var miembrosCol = null;
var configCol = null;
async function initMongoDB() {
  if (!MONGO_URI) {
    console.log("[MongoDB] MONGO_URI no detectado en variables. Operando con persistencia de archivo/memoria.");
    return;
  }
  try {
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    mongoDb = mongoClient.db("of_sparta_db");
    solicitudesCol = mongoDb.collection("solicitudes");
    miembrosCol = mongoDb.collection("miembros");
    configCol = mongoDb.collection("config");
    console.log("[MongoDB] Conectado exitosamente a MongoDB Atlas (Base: of_sparta_db).");
    const mongoApplicants = await solicitudesCol.find({}).toArray();
    const mongoMembers = await miembrosCol.find({}).toArray();
    const mongoConfig = await configCol.findOne({ id: "gameskinbo_config" });
    serverApplicantsStore = mongoApplicants.map(({ _id, ...rest }) => rest);
    serverClanMembersStore = mongoMembers.map(({ _id, ...rest }) => rest);
    if (mongoConfig) {
      if (mongoConfig.primaryKey) serverApiConfig.primaryKey = mongoConfig.primaryKey;
      if (mongoConfig.backupKey) serverApiConfig.backupKey = mongoConfig.backupKey;
      if (mongoConfig.endpoint) serverApiConfig.endpoint = mongoConfig.endpoint;
    }
    console.log(`[MongoDB] Datos sincronizados: ${serverApplicantsStore.length} solicitudes activas, ${serverClanMembersStore.length} miembros oficiales.`);
  } catch (err) {
    console.error("[MongoDB] Error al conectar con MongoDB:", err.message);
  }
}
async function dbSaveConfig(config) {
  if (configCol) {
    try {
      await configCol.updateOne(
        { id: "gameskinbo_config" },
        { $set: { ...config, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
        { upsert: true }
      );
    } catch (err) {
      console.error("[MongoDB] Error guardando config:", err.message);
    }
  }
}
async function dbSaveApplicant(applicant) {
  if (solicitudesCol) {
    try {
      await solicitudesCol.updateOne(
        { id: applicant.id },
        { $set: applicant },
        { upsert: true }
      );
    } catch (err) {
      console.error("[MongoDB] Error guardando solicitud:", err.message);
    }
  }
}
async function dbDeleteApplicant(id, gameId) {
  if (solicitudesCol) {
    try {
      const filter = gameId ? { $or: [{ id }, { gameId }] } : { id };
      await solicitudesCol.deleteMany(filter);
    } catch (err) {
      console.error("[MongoDB] Error eliminando solicitud:", err.message);
    }
  }
}
async function dbSaveMember(member) {
  if (miembrosCol) {
    try {
      await miembrosCol.updateOne(
        { id: member.id },
        { $set: member },
        { upsert: true }
      );
    } catch (err) {
      console.error("[MongoDB] Error guardando miembro:", err.message);
    }
  }
}
async function dbDeleteMember(id) {
  if (miembrosCol) {
    try {
      await miembrosCol.deleteOne({ id });
    } catch (err) {
      console.error("[MongoDB] Error eliminando miembro:", err.message);
    }
  }
}
async function dbUpdateMemberRank(id, rank) {
  if (miembrosCol) {
    try {
      await miembrosCol.updateOne({ id }, { $set: { rank } });
    } catch (err) {
      console.error("[MongoDB] Error actualizando rango:", err.message);
    }
  }
}
function loadServerStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(content);
      if (Array.isArray(data.applicants)) {
        serverApplicantsStore = data.applicants;
      }
      if (Array.isArray(data.members)) {
        serverClanMembersStore = data.members;
      }
      if (data.apiConfig) {
        if (data.apiConfig.primaryKey) serverApiConfig.primaryKey = data.apiConfig.primaryKey;
        if (data.apiConfig.backupKey) serverApiConfig.backupKey = data.apiConfig.backupKey;
        if (data.apiConfig.endpoint) serverApiConfig.endpoint = data.apiConfig.endpoint;
      }
      console.log(`[Storage] Base centralizada cargada: ${serverApplicantsStore.length} solicitudes, ${serverClanMembersStore.length} miembros.`);
    }
  } catch (err) {
    console.warn("[Storage] Aviso al leer archivo local:", err);
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
          apiConfig: serverApiConfig,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        },
        null,
        2
      ),
      "utf-8"
    );
  } catch (err) {
    console.warn("[Storage] Error al persistir datos centrales:", err);
  }
}
loadServerStore();
initMongoDB().catch((err) => console.warn("[MongoDB] Init error:", err));
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    clan: "OF SPARTA",
    platform: "Render + Vercel Architecture",
    uptimeSeconds: Math.floor(process.uptime()),
    applicantsCount: serverApplicantsStore.length,
    membersCount: serverClanMembersStore.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/lideres/login", (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "Contrase\xF1a incorrecta. Acceso denegado." });
    return;
  }
  res.status(200).json({
    success: true,
    mensaje: "Acceso autorizado al panel de l\xEDderes de OF SPARTA.",
    token: "auth-leader-granted"
  });
});
app.post("/api/lideres/ver-todos", async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "Contrase\xF1a incorrecta. Acceso denegado." });
    return;
  }
  res.status(200).json({
    success: true,
    totalReclutas: serverApplicantsStore.length,
    totalMiembros: serverClanMembersStore.length,
    reclutas: serverApplicantsStore,
    miembros: serverClanMembersStore,
    apiConfig: serverApiConfig
  });
});
app.post("/api/lideres/guardar-api-keys", async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "Contrase\xF1a incorrecta. Acceso denegado." });
    return;
  }
  const { primaryKey, backupKey, endpoint } = req.body;
  if (primaryKey !== void 0) serverApiConfig.primaryKey = primaryKey.toString().trim();
  if (backupKey !== void 0) serverApiConfig.backupKey = backupKey.toString().trim();
  if (endpoint !== void 0) serverApiConfig.endpoint = endpoint.toString().trim();
  await dbSaveConfig(serverApiConfig);
  saveServerStore();
  res.status(200).json({
    success: true,
    mensaje: "Claves API de Gameskinbo sincronizadas en el servidor para todos los dispositivos.",
    apiConfig: serverApiConfig
  });
});
app.post("/api/lideres/obtener-api-keys", (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "Contrase\xF1a incorrecta. Acceso denegado." });
    return;
  }
  res.status(200).json({
    success: true,
    apiConfig: serverApiConfig
  });
});
var handleBotar = async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "No tienes permiso para hacer esto." });
    return;
  }
  const { id } = req.params;
  const applicantIndex = serverApplicantsStore.findIndex((a) => a.id === id);
  if (applicantIndex >= 0) {
    const deleted = serverApplicantsStore.splice(applicantIndex, 1);
    await dbDeleteApplicant(id, deleted[0]?.gameId);
    saveServerStore();
    res.status(200).json({
      success: true,
      mensaje: "Jugador rechazado y eliminado de la lista de postulaciones.",
      eliminado: deleted[0]
    });
    return;
  }
  const memberIndex = serverClanMembersStore.findIndex((m) => m.id === id);
  if (memberIndex >= 0) {
    const kicked = serverClanMembersStore.splice(memberIndex, 1);
    await dbDeleteMember(id);
    saveServerStore();
    res.status(200).json({
      success: true,
      mensaje: "Miembro botado y eliminado del clan OF SPARTA.",
      eliminado: kicked[0]
    });
    return;
  }
  res.status(404).json({ error: "Registro no encontrado en el servidor." });
};
app.delete("/api/lideres/botar/:id", handleBotar);
app.post("/api/lideres/botar/:id", handleBotar);
app.post("/api/lideres/cambiar-rango/:id", async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "No tienes permiso para hacer esto." });
    return;
  }
  const { id } = req.params;
  const { rank } = req.body;
  const member = serverClanMembersStore.find((m) => m.id === id);
  if (!member) {
    res.status(404).json({ error: "Miembro no encontrado." });
    return;
  }
  if (rank) {
    member.rank = rank;
    await dbUpdateMemberRank(id, rank);
  }
  saveServerStore();
  res.status(200).json({ success: true, member });
});
app.post("/api/lideres/agregar-miembro", async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "No tienes permiso para hacer esto." });
    return;
  }
  const { gameId, nickname, phone, rank, role, region, level } = req.body;
  if (!gameId || !nickname || !phone) {
    res.status(400).json({ error: "Faltan campos obligatorios (ID, Nickname, WhatsApp)." });
    return;
  }
  const newMember = {
    id: `sparta-mbr-${Date.now()}`,
    gameId: gameId.toString().trim(),
    nickname: nickname.toString().trim(),
    phone: phone.toString().trim(),
    rank: rank || "Miembro",
    role: role || "Rusher",
    region: region || "EEUU",
    level: Number(level) || 65,
    joinedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  serverClanMembersStore.unshift(newMember);
  await dbSaveMember(newMember);
  saveServerStore();
  res.status(200).json({ success: true, member: newMember });
});
app.post("/api/lideres/aceptar-recluta/:id", async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "No tienes permiso para hacer esto." });
    return;
  }
  const { id } = req.params;
  const applicantIndex = serverApplicantsStore.findIndex((a) => a.id === id);
  if (applicantIndex === -1) {
    res.status(404).json({ error: "Solicitud de recluta no encontrada en el servidor." });
    return;
  }
  const applicant = serverApplicantsStore[applicantIndex];
  const cleanNick = applicant.nickname.startsWith("\u26A1SPARTA\u30FB") ? applicant.nickname : `\u26A1SPARTA\u30FB${applicant.nickname}`;
  const existingMemberIndex = serverClanMembersStore.findIndex(
    (m) => m.gameId === applicant.gameId
  );
  let member;
  if (existingMemberIndex >= 0) {
    member = serverClanMembersStore[existingMemberIndex];
  } else {
    member = {
      id: `sparta-mbr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      gameId: applicant.gameId,
      nickname: cleanNick,
      phone: applicant.phone,
      rank: "Miembro",
      role: applicant.role || "Rusher",
      region: applicant.region || "EEUU",
      level: applicant.level || 65,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    serverClanMembersStore.unshift(member);
  }
  await dbSaveMember(member);
  serverApplicantsStore.splice(applicantIndex, 1);
  await dbDeleteApplicant(id, applicant.gameId);
  saveServerStore();
  res.status(200).json({
    success: true,
    mensaje: `\xA1${applicant.nickname} ha sido aceptado oficialmente en el Clan OF SPARTA! Su solicitud ya no se refleja en peticiones.`,
    member
  });
});
app.post("/api/lideres/cambiar-estado/:id", async (req, res) => {
  if (!isAuthorizedLeader(req)) {
    res.status(401).json({ error: "No tienes permiso para hacer esto." });
    return;
  }
  const { id } = req.params;
  const { status, staffNotes } = req.body;
  const applicantIndex = serverApplicantsStore.findIndex((a) => a.id === id);
  if (applicantIndex === -1) {
    res.status(404).json({ error: "Solicitud no encontrada." });
    return;
  }
  if (status === "aceptado") {
    const applicant2 = serverApplicantsStore[applicantIndex];
    const cleanNick = applicant2.nickname.startsWith("\u26A1SPARTA\u30FB") ? applicant2.nickname : `\u26A1SPARTA\u30FB${applicant2.nickname}`;
    const newMember = {
      id: `sparta-mbr-${Date.now()}`,
      gameId: applicant2.gameId,
      nickname: cleanNick,
      phone: applicant2.phone,
      rank: "Miembro",
      role: applicant2.role || "Rusher",
      region: applicant2.region || "EEUU",
      level: applicant2.level || 65,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    serverClanMembersStore.unshift(newMember);
    await dbSaveMember(newMember);
    serverApplicantsStore.splice(applicantIndex, 1);
    await dbDeleteApplicant(id, applicant2.gameId);
    saveServerStore();
    res.status(200).json({
      success: true,
      mensaje: "Recluta aceptado. La solicitud ha sido promovida a Miembro y ya no se refleja en peticiones.",
      member: newMember
    });
    return;
  }
  if (status === "rechazado") {
    const deleted = serverApplicantsStore.splice(applicantIndex, 1);
    await dbDeleteApplicant(id, deleted[0]?.gameId);
    saveServerStore();
    res.status(200).json({
      success: true,
      mensaje: "Postulaci\xF3n rechazada y eliminada de las peticiones activas."
    });
    return;
  }
  const applicant = serverApplicantsStore[applicantIndex];
  if (status) applicant.status = status;
  if (staffNotes !== void 0) applicant.staffNotes = staffNotes;
  applicant.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  await dbSaveApplicant(applicant);
  saveServerStore();
  res.status(200).json({ success: true, applicant });
});
app.get("/api/miembros-publicos", (req, res) => {
  res.status(200).json({
    success: true,
    total: serverClanMembersStore.length,
    members: serverClanMembersStore
  });
});
app.post("/api/consultar-estado", (req, res) => {
  const { phone, gameId } = req.body;
  const cleanPhone = (phone || "").toString().trim().replace(/[\s-]/g, "");
  const cleanGameId = (gameId || "").toString().trim().replace(/\D/g, "");
  if (!cleanPhone || !cleanGameId) {
    res.status(400).json({
      success: false,
      error: "Debes proporcionar tu n\xFAmero de celular y tu ID de Free Fire."
    });
    return;
  }
  const member = serverClanMembersStore.find((m) => {
    const mPhone = m.phone.replace(/[\s-]/g, "");
    const phoneMatch = mPhone === cleanPhone || mPhone.endsWith(cleanPhone) || cleanPhone.endsWith(mPhone);
    const idMatch = m.gameId === cleanGameId;
    return phoneMatch && idMatch;
  });
  if (member) {
    res.status(200).json({
      success: true,
      isMember: true,
      status: "aceptado",
      member,
      applicant: {
        id: member.id,
        gameId: member.gameId,
        nickname: member.nickname,
        phone: member.phone,
        region: member.region,
        role: member.role,
        level: member.level,
        status: "aceptado",
        createdAt: member.joinedAt,
        updatedAt: member.joinedAt
      },
      mensaje: "\xA1Eres miembro oficial del Clan OF SPARTA!"
    });
    return;
  }
  const applicant = serverApplicantsStore.find((a) => {
    const aPhone = a.phone.replace(/[\s-]/g, "");
    const phoneMatch = aPhone === cleanPhone || aPhone.endsWith(cleanPhone) || cleanPhone.endsWith(aPhone);
    const idMatch = a.gameId === cleanGameId;
    return phoneMatch && idMatch;
  });
  if (applicant) {
    res.status(200).json({
      success: true,
      isMember: false,
      status: applicant.status,
      applicant
    });
    return;
  }
  res.status(404).json({
    success: false,
    error: "No se encontr\xF3 ninguna postulaci\xF3n con este n\xFAmero de celular e ID en el servidor. Verifica los datos o env\xEDa una solicitud nueva."
  });
});
app.post("/api/reclutar", async (req, res) => {
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
    reason
  } = req.body;
  const resolvedGameId = (uid || gameId || "").toString().trim();
  const resolvedNick = (nombre || nickname || "").toString().trim();
  const resolvedPhone = (telefono || phone || "").toString().trim().replace(/[\s-]/g, "");
  if (!resolvedGameId || !resolvedNick || !resolvedPhone) {
    res.status(400).json({
      success: false,
      error: "Campos obligatorios incompletos: Se requiere ID de Free Fire, Nickname y Tel\xE9fono de WhatsApp."
    });
    return;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newApplicant = {
    id: `sparta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gameId: resolvedGameId,
    nickname: resolvedNick,
    phone: resolvedPhone,
    region: region || "EEUU",
    role: rol || "Rusher",
    level: Number(nivel) || 65,
    device: device || "M\xF3vil",
    micAvailable: micAvailable !== void 0 ? Boolean(micAvailable) : true,
    reason: reason || `Rango: ${rango || "Heroico"}. Postulaci\xF3n directa enviada al clan OF SPARTA.`,
    status: "pendiente",
    createdAt: now,
    updatedAt: now
  };
  const existingIdx = serverApplicantsStore.findIndex(
    (a) => a.gameId === resolvedGameId || a.phone === resolvedPhone
  );
  if (existingIdx >= 0) {
    serverApplicantsStore[existingIdx] = {
      ...serverApplicantsStore[existingIdx],
      ...newApplicant,
      id: serverApplicantsStore[existingIdx].id,
      createdAt: serverApplicantsStore[existingIdx].createdAt
    };
    await dbSaveApplicant(serverApplicantsStore[existingIdx]);
  } else {
    serverApplicantsStore.unshift(newApplicant);
    await dbSaveApplicant(newApplicant);
  }
  saveServerStore();
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  let webhookTriggered = false;
  if (webhookUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4e3);
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clan: "OF SPARTA",
          evento: "NUEVA_POSTULACION",
          uid: resolvedGameId,
          nombre: resolvedNick,
          telefono: resolvedPhone,
          rol: newApplicant.role,
          region: newApplicant.region,
          mensajeWhatsApp: `\xA1Hola ${resolvedNick}! Tu solicitud para entrar a OF SPARTA (ID ${resolvedGameId}) ha sido recibida con \xE9xito por los moderadores.`,
          timestamp: now
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      webhookTriggered = true;
    } catch (err) {
      console.warn("[Webhook] No se pudo enviar alerta a Make.com:", err.message);
    }
  }
  const welcomeText = encodeURIComponent(
    `\u2694\uFE0F Hola ${resolvedNick}, recibimos tu postulaci\xF3n para el Clan OF SPARTA (ID ${resolvedGameId}). En breve un moderador revisar\xE1 tus estad\xEDsticas.`
  );
  const directWhatsAppUrl = `https://wa.me/${resolvedPhone.replace(/\D/g, "")}?text=${welcomeText}`;
  res.status(200).json({
    success: true,
    mensaje: "\xA1Petici\xF3n enviada con \xE9xito! Cuenta creada en OF SPARTA.",
    applicant: newApplicant,
    webhookTriggered,
    directWhatsAppUrl
  });
});
var handleGameskinboProxy = async (req, res) => {
  const playerId = (req.query.id || req.body?.id || "").trim().replace(/\D/g, "");
  const primaryKey = (req.headers["x-api-key"] || req.query.key || req.body?.key || serverApiConfig.primaryKey || process.env.FREE_FIRE_API_KEY || "").trim();
  const backupKey = (req.headers["x-backup-key"] || req.query.backupKey || req.body?.backupKey || serverApiConfig.backupKey || process.env.FREE_FIRE_BACKUP_API_KEY || "").trim();
  const endpoint = (req.query.endpoint || req.body?.endpoint || serverApiConfig.endpoint || "https://api.gameskinbo.com/api/v1/freefire/player").trim();
  if (!playerId) {
    res.status(400).json({ error: "Falta el ID del jugador de Free Fire." });
    return;
  }
  const callExternalApi = async (key) => {
    const url = new URL(endpoint);
    url.searchParams.set("id", playerId);
    url.searchParams.set("key", key);
    url.searchParams.set("apiKey", key);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8e3);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${key}`,
        "X-API-KEY": key
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  };
  if (primaryKey) {
    try {
      const data = await callExternalApi(primaryKey);
      res.status(200).json({ success: true, source: "primary", data });
      return;
    } catch (err) {
      console.warn("[Gameskinbo] API Primaria fall\xF3, conmutando a Secundaria:", err.message);
    }
  }
  if (backupKey) {
    try {
      const data = await callExternalApi(backupKey);
      res.status(200).json({
        success: true,
        source: "backup",
        message: "Conmutado a API Secundaria exitosamente.",
        data
      });
      return;
    } catch (err) {
      console.warn("[Gameskinbo] API Secundaria tambi\xE9n fall\xF3:", err.message);
    }
  }
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash << 5) - hash + playerId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const level = 55 + absHash % 25;
  const likes = 1500 + absHash % 12e3;
  const kd = 2.4 + absHash % 220 / 100;
  const headshot = 38 + absHash % 38;
  const matches = 900 + absHash % 2200;
  const winRate = 42 + absHash % 28;
  const ranksBR = ["Diamante IV", "Heroico 1\u2605", "Heroico 3\u2605", "Heroico 5\u2605", "Maestro", "Gran Maestro"];
  const ranksCS = ["Heroico 8\u2605", "Heroico 15\u2605", "Heroico 24\u2605", "Maestro", "Gran Maestro"];
  const fallbackData = {
    id: playerId,
    account_id: playerId,
    nickname: `Guerrero_${playerId.slice(-4)}`,
    level,
    likes,
    br_rank: ranksBR[absHash % ranksBR.length],
    br_score: 3300 + absHash % 2500,
    cs_rank: ranksCS[(absHash >> 2) % ranksCS.length],
    cs_stars: 12 + absHash % 30,
    kd_ratio: parseFloat(kd.toFixed(2)),
    headshot_rate: headshot,
    matches,
    wins: Math.round(matches * winRate / 100),
    win_rate: winRate,
    guild_name: absHash % 3 === 0 ? "Sin Clan" : "Clan Competitivo",
    signature: "\xA1Pura cabeza! 1v1 disponible.",
    is_generated: true
  };
  res.status(200).json({
    success: true,
    source: "fallback",
    message: primaryKey || backupKey ? "APIs externas sin respuesta, mostrando datos estimados." : "Modo aut\xF3nomo activo.",
    data: fallbackData
  });
};
app.get("/api/gameskinbo/player", handleGameskinboProxy);
app.post("/api/gameskinbo/player", handleGameskinboProxy);
var distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(PORT, () => {
  console.log(`[OF SPARTA Backend] Escuchando en el puerto ${PORT}`);
  console.log(`[OF SPARTA Backend] Health check listo en /api/health`);
  console.log(`[OF SPARTA Backend] Rutas de l\xEDderes protegidas con contrase\xF1a`);
});
