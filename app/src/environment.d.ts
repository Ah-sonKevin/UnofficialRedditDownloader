declare global {
	namespace NodeJS {
		interface ProcessEnv {
			HOST: string;
			HOST_PORT: string;
		}
	}
}

export {};
