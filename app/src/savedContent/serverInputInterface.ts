export interface BatchItem {
	needYtDl: boolean;
	folder?: string;
	name: string;
	url: string;
}

export interface SoloItem {
	needYtDl: boolean;
	url: string;
}
