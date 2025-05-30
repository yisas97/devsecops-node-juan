const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Importar rutas
const healthRoutes = require("./routes/health");
const apiRoutes = require("./routes/api");

// Importar middleware
const securityMiddleware = require("./middleware/security");
const validationMiddleware = require("./middleware/validation");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// =====================================
// CONFIGURACIÓN DE SEGURIDAD
// =====================================

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: NODE_ENV === "production" ? 100 : 1000, // límite basado en entorno
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas peticiones, intenta más tarde",
    retryAfter: "15 minutos",
  },
});

// Configuración de Helmet para headers de seguridad
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configurado
const corsOptions = {
  origin:
    NODE_ENV === "production"
      ? ["https://devsecops-uni-nodejs.azurewebsites.net"]
      : ["http://localhost:3000", "http://localhost:8080"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// =====================================
// MIDDLEWARE GENERAL
// =====================================

app.use(compression());
app.use(limiter);
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware personalizado de seguridad
app.use(securityMiddleware);

// =====================================
// INFORMACIÓN DE LA APLICACIÓN
// =====================================

// Endpoint principal
app.get("/", (req, res) => {
  const appInfo = {
    message: "🚀 DevSecOps Demo - Desplegado en Azure",
    project: "Proyecto Universidad Nacional de Ingeniería",
    technology: "Node.js + Express.js",
    version: process.env.npm_package_version || "1.0.0",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    author: "Estudiante UNI",
    university: "Universidad Nacional de Ingeniería",
    security: {
      helmet: "Activado ✅",
      cors: "Configurado ✅",
      rateLimit: "Activo ✅",
      inputValidation: "Habilitado ✅",
      compression: "Activado ✅",
    },
    features: [
      "API REST segura",
      "Health checks",
      "Logging estructurado",
      "Rate limiting",
      "Input validation",
      "Error handling",
    ],
  };

  res.json(appInfo);
});

// =====================================
// RUTAS
// =====================================

app.use("/", healthRoutes);
app.use("/api", apiRoutes);

// =====================================
// MANEJO DE ERRORES
// =====================================

// Middleware para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint no encontrado",
    message: "La ruta solicitada no existe",
    requestedUrl: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "GET /",
      "GET /health",
      "GET /api/info",
      "GET /api/security",
      "POST /api/validate",
    ],
  });
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error(`[ERROR ${new Date().toISOString()}]`, {
    error: err.message,
    stack: NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  const errorResponse = {
    error: "Error interno del servidor",
    message:
      NODE_ENV === "development"
        ? err.message
        : "Algo salió mal en el servidor",
    timestamp: new Date().toISOString(),
    requestId: req.headers["x-request-id"] || "unknown",
  };

  if (NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      url: req.url,
      method: req.method,
      headers: req.headers,
    };
  }

  res.status(err.status || 500).json(errorResponse);
});

// =====================================
// INICIO DEL SERVIDOR
// =====================================

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log("🚀 DEVSECOPS DEMO - UNIVERSIDAD NACIONAL DE INGENIERÍA");
  console.log("=".repeat(50));
  console.log(`🌍 Servidor ejecutándose en puerto: ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔒 Seguridad: Helmet, CORS, Rate Limiting`);
  console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
  console.log(`🔗 URL Local: http://localhost:${PORT}`);
  console.log(`📋 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Info: http://localhost:${PORT}/api/info`);
  console.log("=".repeat(50));
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📡 Señal ${signal} recibida, cerrando servidor...`);
  server.close((err) => {
    if (err) {
      console.error("❌ Error cerrando servidor:", err);
      process.exit(1);
    }
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Manejo de promesas rechazadas
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

module.exports = app;
