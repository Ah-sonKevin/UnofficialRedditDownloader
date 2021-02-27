export type ItemInfo = OneChannelItemInfo | MultiChannelItemInfo;

export interface OneChannelItemInfo {
	url: string;
	size: number;
	name: string;
	folder?: string;
	ext: string;
	needYoutubeDl: boolean;
}

export interface MultiChannelItemInfo {
	size: number;
	name: string;
	folder?: string;
	needYoutubeDl: boolean;
	ext: string;
	video: {
		ext: string;
		url: string;
	};
	audio: {
		ext: string;
		url: string;
	};
}

export function isOneChannel(item: ItemInfo): item is OneChannelItemInfo {
	// todo test guards
	const one = item as OneChannelItemInfo;
	return one.url !== undefined;
}

export function isMultiChannel(item: ItemInfo): item is MultiChannelItemInfo {
	const multi = item as MultiChannelItemInfo;
	return multi.video !== undefined && multi.audio !== undefined;
}
