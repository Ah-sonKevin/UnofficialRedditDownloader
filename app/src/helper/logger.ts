import winston from "winston";
// import a = require("./serverInfo.js");
import {HOST,PORT} from "../../info/serverInfo";


const logger = winston.createLogger({
	format: winston.format.json(), // tocheck
	defaultMeta: { service: "user-service" }, // tocheck why
	transports: [
		new winston.transports.Console(),
		new winston.transports.Http({
			// tocheck
			host: HOST,
			port: PORT,
			path: "/api/logError",
			ssl: true,
			level: "error",
		}),
	],
});
