import SavedContent from "@/savedContent/savedContent";

// eslint-disable-next-line max-params
export function filterItems(
	items: SavedContent[],
	typeFilter: string[],
	categoryFilter: string[],
	subredditFilter: string[],
): SavedContent[] {
	if (
		typeFilter.length === 0 &&
		categoryFilter.length === 0 &&
		subredditFilter.length === 0
	) {
		return items;
	}
	const res = items.filter(el => {
		if (
			typeFilter.includes(el.type) ||
			(el.category && categoryFilter.includes(el.category)) ||
			subredditFilter.includes(el.subreddit)
		) {
			return true;
		}
		return false;
	});
	return res;
}
export function searchByText(
	items: SavedContent[],
	searchInput: string,
): SavedContent[] {
	return items.filter(item => {
		return item.title.toLowerCase().includes(searchInput.toLowerCase());
	});
}
export function hideDeleted(
	items: SavedContent[],
	showDeleted: boolean,
): SavedContent[] {
	let res = [];
	if (showDeleted) {
		res = items;
	} else {
		res = items.filter(el => !el.isDeleted);
	}
	return res;
}

export function setFilter(el: string, filterList: string[]): void {
	if (filterList.includes(el)) {
		const index = filterList.indexOf(el);
		filterList.splice(index, 1);
	} else {
		filterList.push(el);
	}
}
