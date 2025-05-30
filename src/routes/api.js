const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const securityService = require("../services/security");

// Información de la API
router.get("/info", (req, res) => {
  const apiInfo = {
    message: "API protegida con middleware de seguridad",
    version: "1.0.0",
    documentation: "/api/docs",
    security: {
      features: securityService.getSecurityFeatures(),
      practices: securityService.getDevSecOpsPractices(),
    },
    endpoints: [
      {
        method: "GET",
        path: "/api/info",
        description: "Información de la API",
      },
      {
        method: "GET",
        path: "/api/security",
        description: "Estado de seguridad",
      },
      { method: "POST", path: "/api/validate", description: "Validar entrada" },
      {
        method: "GET",
        path: "/api/demo",
        description: "Endpoint de demostración",
      },
    ],
    timestamp: new Date().toISOString(),
  };

  res.json(apiInfo);
});

// Estado de seguridad
router.get("/security", (req, res) => {
  const securityStatus = {
    status: "SECURE",
    message: "Todas las medidas de seguridad activas",
    features: {
      helmet: "Activado - Headers de seguridad HTTP",
      cors: "Configurado - Control de acceso cruzado",
      rateLimit: "Activo - Límite de peticiones por IP",
      inputValidation: "Habilitado - Validación de entrada",
      compression: "Activado - Compresión de respuestas",
      logging: "Configurado - Registro de actividad",
    },
    checks: {
      xssProtection: securityService.testXSSProtection(),
      sqlInjectionProtection: securityService.testSQLInjectionProtection(),
      headersSecurity: securityService.checkSecurityHeaders(req),
    },
    lastUpdated: new Date().toISOString(),
  };

  res.json(securityStatus);
});

// Endpoint de validación
router.post(
  "/validate",
  [
    body("data").notEmpty().withMessage("Data es requerido"),
    body("data")
      .isLength({ min: 1, max: 1000 })
      .withMessage("Data debe tener entre 1 y 1000 caracteres"),
    body("type")
      .optional()
      .isIn(["text", "email", "url"])
      .withMessage("Tipo debe ser text, email o url"),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Datos de entrada inválidos",
        details: errors.array(),
        timestamp: new Date().toISOString(),
      });
    }

    const { data, type = "text" } = req.body;

    const validationResult = {
      original: data,
      sanitized: securityService.sanitizeInput(data),
      isValid: securityService.validateInput(data),
      type: type,
      checks: {
        xssAttempt: securityService.detectXSS(data),
        sqlInjectionAttempt: securityService.detectSQLInjection(data),
        length: data.length,
        encoding: "UTF-8",
      },
      timestamp: new Date().toISOString(),
    };

    res.json({
      message: "Validación completada",
      result: validationResult,
    });
  }
);

// Endpoint de demostración
router.get("/demo", (req, res) => {
  console.log(
    `[${new Date().toISOString()}] Demo API llamado desde IP: ${req.ip}`
  );

  const demoData = {
    message: "Endpoint de demostración funcionando correctamente",
    request: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      method: req.method,
      url: req.originalUrl,
      headers: {
        "content-type": req.get("Content-Type"),
        accept: req.get("Accept"),
        "accept-language": req.get("Accept-Language"),
      },
    },
    server: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
    },
    security: {
      rateLimitRemaining: req.rateLimit?.remaining || "N/A",
      secureHeaders: "Aplicados",
      inputValidation: "Activo",
    },
  };

  res.json(demoData);
});

module.exports = router;
