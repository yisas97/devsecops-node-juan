const request = require("supertest");
const app = require("../src/app");
const securityService = require("../src/services/security");

describe("Security Features", () => {
  describe("Input Validation", () => {
    it("should validate safe input", () => {
      const safeInput = "usuario@email.com";
      expect(securityService.validateInput(safeInput)).toBe(true);
    });

    it("should reject SQL injection attempts", () => {
      const sqlInjection = "'; DROP TABLE users; --";
      expect(securityService.validateInput(sqlInjection)).toBe(false);
    });

    it("should reject XSS attempts", () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      expect(securityService.validateInput(xssAttempt)).toBe(false);
    });

    it("should handle null and undefined inputs", () => {
      expect(securityService.validateInput(null)).toBe(false);
      expect(securityService.validateInput(undefined)).toBe(false);
      expect(securityService.validateInput("")).toBe(false);
    });
  });

  describe("Input Sanitization", () => {
    it("should sanitize XSS content", () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello';
      const sanitized = securityService.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("Hello");
    });

    it("should remove event handlers", () => {
      const maliciousInput = '<img src="x" onerror="alert(1)">';
      const sanitized = securityService.sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain("onerror=");
    });

    it("should handle null input in sanitization", () => {
      expect(securityService.sanitizeInput(null)).toBe(null);
      expect(securityService.sanitizeInput(undefined)).toBe(undefined);
    });
  });

  describe("XSS Detection", () => {
    it("should detect XSS attempts", () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '<iframe src="javascript:alert(1)"></iframe>',
      ];

      xssAttempts.forEach((attempt) => {
        expect(securityService.detectXSS(attempt)).toBe(true);
      });
    });

    it("should not flag safe content as XSS", () => {
      const safeContent = [
        "Hello World",
        "usuario@email.com",
        "https://example.com",
        "Normal text with numbers 123",
      ];

      safeContent.forEach((content) => {
        expect(securityService.detectXSS(content)).toBe(false);
      });
    });
  });

  describe("SQL Injection Detection", () => {
    it("should detect SQL injection attempts", () => {
      const sqlAttempts = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "UNION SELECT * FROM users",
        "admin'--",
        "1; DELETE FROM users",
      ];

      sqlAttempts.forEach((attempt) => {
        expect(securityService.detectSQLInjection(attempt)).toBe(true);
      });
    });

    it("should not flag normal content as SQL injection", () => {
      const normalContent = [
        "select a movie",
        "union of workers",
        "drop me a line",
        "insert coin",
      ];

      normalContent.forEach((content) => {
        expect(securityService.detectSQLInjection(content)).toBe(false);
      });
    });
  });

  describe("API Security Endpoints", () => {
    it("should return API information", async () => {
      const response = await request(app).get("/api/info");

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("API protegida");
      expect(response.body.security.features).toBeInstanceOf(Array);
      expect(response.body.security.practices).toBeInstanceOf(Array);
    });

    it("should return security status", async () => {
      const response = await request(app).get("/api/security");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("SECURE");
      expect(response.body.features).toBeDefined();
      expect(response.body.checks).toBeDefined();
    });

    it("should validate input through API", async () => {
      const response = await request(app)
        .post("/api/validate")
        .send({ data: "safe input", type: "text" });

      expect(response.status).toBe(200);
      expect(response.body.result.isValid).toBe(true);
    });

    it("should reject malicious input through API", async () => {
      const response = await request(app)
        .post("/api/validate")
        .send({ data: '<script>alert("xss")</script>' });

      expect(response.status).toBe(200);
      expect(response.body.result.isValid).toBe(false);
      expect(response.body.result.checks.xssAttempt).toBe(true);
    });

    it("should handle validation errors", async () => {
      const response = await request(app).post("/api/validate").send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Datos de entrada inválidos");
    });
  });

  describe("Rate Limiting", () => {
    it("should allow normal request rate", async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(request(app).get("/"));
      }

      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe("Security Service Methods", () => {
    it("should test XSS protection", () => {
      expect(securityService.testXSSProtection()).toBe(true);
    });

    it("should test SQL injection protection", () => {
      expect(securityService.testSQLInjectionProtection()).toBe(true);
    });

    it("should return security features list", () => {
      const features = securityService.getSecurityFeatures();
      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(0);
      expect(features[0]).toContain("Helmet.js");
    });

    it("should return DevSecOps practices list", () => {
      const practices = securityService.getDevSecOpsPractices();
      expect(practices).toBeInstanceOf(Array);
      expect(practices.length).toBeGreaterThan(0);
      expect(practices[0]).toContain("Static Analysis");
    });
  });
});
