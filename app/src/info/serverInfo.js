if (!process.env.HOST || !process.env.HOST_PORT) {
	throw new Error("Invalid environment");
}

const HOST = process.env.HOST;
const PORT = process.env.HOST_PORT;

module.exports = { HOST, PORT };
