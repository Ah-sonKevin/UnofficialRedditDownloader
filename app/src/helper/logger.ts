import "setimmediate";
import winston from "winston";
import HttpStreamTransport from "winston-transport-http-stream";

export const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.json(),
		winston.format.timestamp(),
		winston.format.colorize(),
		winston.format.metadata(),
	),
	transports: [
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		new HttpStreamTransport({
			url: `${process.env.HOST}:${process.env.HOST_PORT}/api/logError/`,
		}),
		new winston.transports.Console(),
	],
});
