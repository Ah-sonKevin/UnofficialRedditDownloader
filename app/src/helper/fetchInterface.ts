export class Init {
	private method: fetchMethod;

	private body: string;

	private headers: { "Content-type": string };

	constructor($method: fetchMethod, $body: string, $header: string) {
		this.method = $method;
		this.body = $body;
		this.headers = { "Content-type": $header };
	}
}

export enum fetchMethod {
	POST = "POST",
	GET = "GET",
}
