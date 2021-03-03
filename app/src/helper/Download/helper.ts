import {
	isGallery,
	isImage,
	isLink,
	isText,
	isVideo,
	SavedContentType
} from "@/savedContent/ISavedContent";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";

export const cancelController = new AbortController();
const suffixList = ["B", "KiB", "MiB", "GiB"];
const SIZE_RATIO = 1024;
const SIZE_DECIMAL_PRECISION = 2;

export function getName(text: string, extension: string): string {
	return `${text}.${extension}`;
}
// tocheck update spinner
export function getSizeInfo(
	totalSize: number,
): {
	suffix: string;
	divider: number;
	size: number;
} {
	let multiple = 0;
	while (totalSize > SIZE_RATIO) {
		totalSize /= SIZE_RATIO;
		multiple += 1;
	}
	return {
		suffix: suffixList[multiple],
		divider: SIZE_RATIO ** multiple,
		size: 1 + totalSize / SIZE_RATIO,
	};
}

export function exhaustivenessCheck(): never {
	throw new Error();
}

export function getExt(item: SavedContentType): string {
	if (isText(item) || isLink(item)) {
		// tocheck isLink
		return "txt";
	}
	if (isVideo(item) || isImage(item) || isGallery(item)) {
		return item.getMediaUrl().split(".").slice(-1)[0];
	}
	return exhaustivenessCheck();
}

export function updateDownloadSpinner(
	downloadIndicator: ILoadingInstance,
	receivedData: number,
	{ size, divider, suffix }: { size: number; divider: number; suffix: string },
): void {
	downloadIndicator.setText(
		`Downloading : ${(receivedData / divider).toFixed(
			SIZE_DECIMAL_PRECISION,
		)}/${size.toFixed(SIZE_DECIMAL_PRECISION)} ${suffix}`,
	);
}
