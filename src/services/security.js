class SecurityService {
  constructor() {
    this.sqlInjectionPatterns = [
      /(\%27)|(')|(--)|(\%23)|(#)/i,
      /((\%3D)|(=))[^\n]*((\%27)|(')|(--)|(\%3B)|(;))/i,
      /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
      /union[\s\w]*select/i,
      /select[\s\w]*from/i,
      /insert[\s\w]*into/i,
      /delete[\s\w]*from/i,
      /update[\s\w]*set/i,
      /drop[\s\w]*table/i,
    ];

    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
    ];
  }

  validateInput(input) {
    if (!input || typeof input !== "string") {
      return false;
    }

    // Verificar patrones de SQL injection
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(input)) {
        console.warn("[SECURITY] SQL Injection attempt detected:", input);
        return false;
      }
    }

    // Verificar patrones de XSS
    for (const pattern of this.xssPatterns) {
      if (pattern.test(input)) {
        console.warn("[SECURITY] XSS attempt detected:", input);
        return false;
      }
    }

    return true;
  }

  sanitizeInput(input) {
    if (!input || typeof input !== "string") {
      return input;
    }

    let sanitized = input;

    // Remover scripts
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );

    // Remover event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, "");

    // Remover javascript: urls
    sanitized = sanitized.replace(/javascript:/gi, "");

    // Remover vbscript
    sanitized = sanitized.replace(/vbscript:/gi, "");

    // Escapar caracteres HTML
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    return sanitized.trim();
  }

  detectXSS(input) {
    if (!input || typeof input !== "string") {
      return false;
    }

    return this.xssPatterns.some((pattern) => pattern.test(input));
  }

  detectSQLInjection(input) {
    if (!input || typeof input !== "string") {
      return false;
    }

    return this.sqlInjectionPatterns.some((pattern) => pattern.test(input));
  }

  testXSSProtection() {
    const testCases = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
    ];

    return testCases.every((test) => !this.validateInput(test));
  }

  testSQLInjectionProtection() {
    const testCases = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "UNION SELECT * FROM users",
    ];

    return testCases.every((test) => !this.validateInput(test));
  }

  checkSecurityHeaders(req) {
    const requiredHeaders = [
      "x-content-type-options",
      "x-frame-options",
      "x-xss-protection",
      "strict-transport-security",
    ];

    const presentHeaders = requiredHeaders.filter(
      (header) => req.headers[header] || req.res?.getHeader(header)
    );

    return {
      required: requiredHeaders.length,
      present: presentHeaders.length,
      missing: requiredHeaders.filter((h) => !presentHeaders.includes(h)),
      compliance: Math.round(
        (presentHeaders.length / requiredHeaders.length) * 100
      ),
    };
  }

  getSecurityFeatures() {
    return [
      "Helmet.js - Headers de seguridad HTTP",
      "CORS - Control de acceso cruzado",
      "Rate Limiting - Límite de peticiones",
      "Input Validation - Validación de entrada",
      "XSS Protection - Protección contra Cross-Site Scripting",
      "SQL Injection Prevention - Prevención de inyección SQL",
      "Request Logging - Registro de peticiones",
      "Error Handling - Manejo seguro de errores",
    ];
  }

  getDevSecOpsPractices() {
    return [
      "Static Analysis - Análisis estático con SonarCloud",
      "Dependency Scanning - Escaneo de vulnerabilidades con Snyk",
      "Container Security - Scanner Trivy para contenedores",
      "Automated Testing - Tests automatizados de seguridad",
      "Infrastructure as Code - Docker y Azure ARM Templates",
      "Continuous Monitoring - Monitoreo continuo de seguridad",
      "Security Headers - Headers HTTP de seguridad",
      "Input Sanitization - Sanitización automática de entrada",
    ];
  }
}

module.exports = new SecurityService();
