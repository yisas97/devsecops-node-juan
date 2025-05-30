const securityMiddleware = (req, res, next) => {
  // Timestamp para medir tiempo de respuesta
  req.startTime = Date.now();

  // Agregar headers adicionales de seguridad
  res.set({
    "X-Powered-By": "DevSecOps-UNI",
    "X-Request-ID":
      req.headers["x-request-id"] || Math.random().toString(36).substr(2, 9),
    "X-Response-Time": "",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  // Log de peticiones para auditoría
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    referer: req.get("Referer") || "direct",
  };

  console.log("[SECURITY] Request:", JSON.stringify(logData));

  // Interceptar respuesta para agregar tiempo de respuesta
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - req.startTime;
    res.set("X-Response-Time", `${responseTime}ms`);
    originalSend.call(this, data);
  };

  next();
};

module.exports = securityMiddleware;
