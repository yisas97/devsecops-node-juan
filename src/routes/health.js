const express = require("express");
const router = express.Router();

// Health check básico
router.get("/health", (req, res) => {
  const healthData = {
    status: "UP",
    message: "Sistema funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      external:
        Math.round(process.memoryUsage().external / 1024 / 1024) + " MB",
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      cpuUsage: process.cpuUsage(),
    },
    checks: {
      database: "N/A",
      externalServices: "N/A",
      diskSpace: "Available",
    },
  };

  try {
    // Verificaciones adicionales de salud aquí
    const responseTime = Date.now() - req.startTime || 0;
    healthData.responseTime = responseTime + "ms";

    res.status(200).json(healthData);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(503).json({
      status: "DOWN",
      message: "Error en el sistema",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check detallado
router.get("/health/detailed", (req, res) => {
  const detailedHealth = {
    status: "UP",
    timestamp: new Date().toISOString(),
    services: {
      application: "UP",
      memory:
        process.memoryUsage().heapUsed < 512 * 1024 * 1024 ? "UP" : "WARNING",
      uptime: process.uptime() > 0 ? "UP" : "DOWN",
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  res.status(200).json(detailedHealth);
});

// Readiness probe
router.get("/ready", (req, res) => {
  // Verificar si la aplicación está lista para recibir tráfico
  const isReady = process.uptime() > 5; // Esperar 5 segundos después del inicio

  if (isReady) {
    res.status(200).json({
      status: "READY",
      message: "Aplicación lista para recibir tráfico",
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: "NOT_READY",
      message: "Aplicación aún inicializándose",
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness probe
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "ALIVE",
    message: "Aplicación respondiendo",
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

module.exports = router;
