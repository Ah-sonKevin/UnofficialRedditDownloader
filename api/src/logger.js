const winston = require("winston");

const serverLogger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "../log/errors/serverErrors" }),
  ],
});

const clientLogger = winston.createLogger({
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "../log/errors/clientsErrors" }),
  ],
});
