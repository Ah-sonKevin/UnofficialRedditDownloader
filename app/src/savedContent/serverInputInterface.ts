export interface BatchItem {
	// tocheck need name ?
	needYtDl: boolean;
	folder?: string;
	name: string;
	url: string;
}

export interface SoloItem {
	needYtDl: boolean;
	url: string;
}
