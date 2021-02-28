export interface Item {
	path: string;
	name: string;
}
export interface SuccessList {
	success: string[];
	fail: string[];
}

export interface ItemInfo {
	// todo or batchItem
	url: string;
	name: string;
	needYtDl: boolean;
	folder?: string;
}
