const validator = require("express-validator");

// Middleware para sanitizar inputs
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key]
          .trim()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      }
    });
  }

  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === "string") {
        req.query[key] = req.query[key]
          .trim()
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/javascript:/gi, "")
          .replace(/on\w+\s*=/gi, "");
      }
    });
  }

  next();
};

// Reglas de validación comunes
const commonValidations = {
  email: validator
    .body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Email debe ser válido"),

  text: validator
    .body("text")
    .isLength({ min: 1, max: 500 })
    .withMessage("Texto debe tener entre 1 y 500 caracteres"),

  id: validator
    .param("id")
    .isInt({ min: 1 })
    .withMessage("ID debe ser un número entero positivo"),
};

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validator.validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      error: "Errores de validación",
      details: errorDetails,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

module.exports = {
  sanitizeInputs,
  commonValidations,
  handleValidationErrors,
};
