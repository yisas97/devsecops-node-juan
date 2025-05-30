const request = require("supertest");
const app = require("../src/app");

describe("Health Check Endpoints", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("UP");
      expect(response.body.message).toBe("Sistema funcionando correctamente");
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(response.body.memory).toBeDefined();
      expect(response.body.system).toBeDefined();
    });

    it("should include memory information", async () => {
      const response = await request(app).get("/health");

      expect(response.body.memory.used).toMatch(/\d+ MB/);
      expect(response.body.memory.total).toMatch(/\d+ MB/);
      expect(response.body.memory.external).toMatch(/\d+ MB/);
    });

    it("should include system information", async () => {
      const response = await request(app).get("/health");

      expect(response.body.system.platform).toBeDefined();
      expect(response.body.system.nodeVersion).toBeDefined();
      expect(response.body.system.pid).toBeDefined();
      expect(response.body.system.cpuUsage).toBeDefined();
    });
  });

  describe("GET /health/detailed", () => {
    it("should return detailed health information", async () => {
      const response = await request(app).get("/health/detailed");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("UP");
      expect(response.body.services).toBeDefined();
      expect(response.body.metrics).toBeDefined();
    });

    it("should include service status", async () => {
      const response = await request(app).get("/health/detailed");

      expect(response.body.services.application).toBe("UP");
      expect(response.body.services.memory).toMatch(/UP|WARNING/);
      expect(response.body.services.uptime).toBe("UP");
    });
  });

  describe("GET /ready", () => {
    it("should return readiness status", async () => {
      const response = await request(app).get("/ready");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("READY");
      expect(response.body.message).toContain("lista para recibir tráfico");
    });
  });

  describe("GET /live", () => {
    it("should return liveness status", async () => {
      const response = await request(app).get("/live");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("ALIVE");
      expect(response.body.message).toBe("Aplicación respondiendo");
      expect(response.body.pid).toBeDefined();
    });
  });
});
