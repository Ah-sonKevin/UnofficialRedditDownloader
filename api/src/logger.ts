// todo needed for module with its own scope
import winston from "winston";

export {};

export const serverLogger = winston.createLogger({
	format: winston.format.combine(
		winston.format.json(),
		winston.format.timestamp(),
		winston.format.colorize(),
		winston.format.align(),
		winston.format.metadata(),
	),
	transports: [
		new winston.transports.File({
			filename: "log/errors/serverErrors.log",
		}),
	],
});

export const clientLogger = winston.createLogger({
	format: winston.format.json(),
	transports: [
		new winston.transports.File({
			filename: "log/errors/clientErrors.log",
		}),
	],
});
