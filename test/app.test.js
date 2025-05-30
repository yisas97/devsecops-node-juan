const request = require("supertest");
const app = require("../src/app");

describe("DevSecOps Node.js Application", () => {
  describe("GET /", () => {
    it("should return application information", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("DevSecOps Demo");
      expect(response.body.project).toContain("Universidad Nacional");
      expect(response.body.technology).toBe("Node.js + Express.js");
      expect(response.body.author).toBe("Estudiante UNI");
      expect(response.body.security).toBeDefined();
      expect(response.body.features).toBeInstanceOf(Array);
    });

    it("should include security configuration", async () => {
      const response = await request(app).get("/");

      expect(response.body.security.helmet).toBe("Activado ✅");
      expect(response.body.security.cors).toBe("Configurado ✅");
      expect(response.body.security.rateLimit).toBe("Activo ✅");
      expect(response.body.security.inputValidation).toBe("Habilitado ✅");
    });
  });

  describe("Security Headers", () => {
    it("should include security headers", async () => {
      const response = await request(app).get("/");

      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["x-powered-by"]).toBe("DevSecOps-UNI");
      expect(response.headers["x-response-time"]).toBeDefined();
    });

    it("should set cache control headers", async () => {
      const response = await request(app).get("/");

      expect(response.headers["cache-control"]).toBe(
        "no-cache, no-store, must-revalidate"
      );
      expect(response.headers["pragma"]).toBe("no-cache");
      expect(response.headers["expires"]).toBe("0");
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Endpoint no encontrado");
      expect(response.body.availableEndpoints).toBeInstanceOf(Array);
      expect(response.body.requestedUrl).toBe("/unknown-route");
    });

    it("should handle different HTTP methods on unknown routes", async () => {
      const response = await request(app).post("/unknown-route");

      expect(response.status).toBe(404);
      expect(response.body.method).toBe("POST");
    });
  });

  describe("CORS Configuration", () => {
    it("should handle OPTIONS request", async () => {
      const response = await request(app)
        .options("/")
        .set("Origin", "http://localhost:3000");

      expect(response.status).toBe(204);
    });
  });
});
