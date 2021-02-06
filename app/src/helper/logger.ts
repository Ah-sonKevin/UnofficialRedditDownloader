import "setimmediate";
import winston from "winston";
import { HOST, PORT } from "../info/serverInfo";

export const logger = winston.createLogger({
	format: winston.format.json(),
	transports: [
		new winston.transports.Console(),
		new winston.transports.Http({
			host: HOST,
			port: PORT,
			path: "/api/logError",
			ssl: true,
			level: "error",
		}),
	],
});
