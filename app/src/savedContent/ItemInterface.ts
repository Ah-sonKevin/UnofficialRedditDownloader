export interface Item {
	path: string;
	name: string;
}
export interface SuccessList {
	success: Item[];
	fail: Item[];
}

export interface ItemInfo {
	url: string;
	name: string;
	needYtDl: boolean;
	folder: string;
}
