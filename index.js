// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 1e4;
var allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()) : ["*"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
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
var serverClanMembersStore = [
  {
    id: "sparta-mbr-1",
    gameId: "1092837415",
    nickname: "\u26A1SPARTA\u30FBLEONIDAS",
    phone: "+525512340001",
    rank: "L\xEDder",
    role: "IGL / Capit\xE1n",
    region: "EEUU",
    level: 79,
    joinedAt: "2025-01-15T00:00:00.000Z"
  },
  {
    id: "sparta-mbr-2",
    gameId: "1849204981",
    nickname: "\u26A1SPARTA\u30FBARES",
    phone: "+525512340002",
    rank: "Col\xEDder",
    role: "Rusher",
    region: "EEUU",
    level: 76,
    joinedAt: "2025-02-10T00:00:00.000Z"
  },
  {
    id: "sparta-mbr-3",
    gameId: "2093849182",
    nickname: "\u26A1SPARTA\u30FBATHENA",
    phone: "+573102340003",
    rank: "Capit\xE1n",
    role: "Sniper",
    region: "EEUU",
    level: 74,
    joinedAt: "2025-03-01T00:00:00.000Z"
  },
  {
    id: "sparta-mbr-4",
    gameId: "1540928374",
    nickname: "\u26A1SPARTA\u30FBKRATOS",
    phone: "+549112340004",
    rank: "Veterano",
    role: "Rusher",
    region: "SUD",
    level: 72,
    joinedAt: "2025-04-12T00:00:00.000Z"
  },
  {
    id: "sparta-mbr-5",
    gameId: "2837491028",
    nickname: "\u26A1SPARTA\u30FBVULCAN",
    phone: "+519872340005",
    rank: "Veterano",
    role: "Soporte",
    region: "SUD",
    level: 71,
    joinedAt: "2025-05-20T00:00:00.000Z"
  }
];
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
    miembros: serverClanMembersStore
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
app.post("/api/lideres/cambiar-rango/:id", (req, res) => {
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
  }
  res.status(200).json({ success: true, member });
});
app.post("/api/lideres/agregar-miembro", (req, res) => {
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
  res.status(200).json({ success: true, member: newMember });
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
  } else {
    serverApplicantsStore.unshift(newApplicant);
  }
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
app.get("/api/gameskinbo/player", async (req, res) => {
  const playerId = req.query.id || "";
  const primaryKey = req.headers["x-api-key"] || req.query.key || process.env.FREE_FIRE_API_KEY || "";
  const backupKey = req.headers["x-backup-key"] || req.query.backupKey || process.env.FREE_FIRE_BACKUP_API_KEY || "";
  const endpoint = req.query.endpoint || "https://api.gameskinbo.com/api/v1/freefire/player";
  if (!playerId) {
    res.status(400).json({ error: "Falta el ID del jugador." });
    return;
  }
  const callExternalApi = async (key) => {
    const url = new URL(endpoint);
    url.searchParams.set("id", playerId);
    url.searchParams.set("key", key);
    url.searchParams.set("apiKey", key);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6e3);
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
      console.warn("API Primaria fall\xF3 en servidor Render, intentando API Secundaria:", err.message);
    }
  }
  if (backupKey) {
    try {
      const data = await callExternalApi(backupKey);
      res.status(200).json({
        success: true,
        source: "backup",
        message: "Conmutado a API Secundaria por l\xEDmite de cuota.",
        data
      });
      return;
    } catch (err) {
      console.warn("API Secundaria tambi\xE9n fall\xF3:", err.message);
    }
  }
  res.status(503).json({
    success: false,
    message: "APIs no disponibles o claves no configuradas en Render."
  });
});
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
