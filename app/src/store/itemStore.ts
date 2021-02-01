import { Couple } from "@/helper/couple";
import { fetchOapi, postOapi } from "@/helper/fetchHelper";
import SavedContent from "@/object/savedContent";
import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

// @Module({ dynamic: true, store, name: 'item' })
@Module({ name: "item" })
export default class ItemStore extends VuexModule {
	items: SavedContent[] = [];

	categories: string[] = [];

	subreddits: string[] = [];

	typeFilter: string[] = [];

	categoryFilter: string[] = [];

	subredditFilter: string[] = [];

	videoWarning = false;

	@Mutation
	setWarning(): void {
		this.videoWarning = true;
	}

	@Mutation
	setCategories(categories: string[]): void {
		this.categories = categories;
	}

	@Mutation
	setSubredditList(items: SavedContent[]): string[] {
		const listSub: string[] = [];
		items.forEach((post: SavedContent) => {
			if (!listSub.includes(post.subreddit)) {
				listSub.push(post.subreddit);
			}
		});

		return listSub;
	}

	@Mutation
	setItems(items: SavedContent[]): void {
		this.items = items;
	}

	@Action({ rawError: true })
	setItemsAndList(items: SavedContent[]): void {
		this.setItems(items);
		this.setSubredditList(items);
	}

	@Action({ commit: "setCategories", rawError: true })
	async fetchCategories(): Promise<string[]> {
		const res = await fetchOapi("/api/saved_categories");
		if (res.ok) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return res.json();
		}
		return [];
	}

	@Mutation
	setSelected({ el, value }: { el: SavedContent; value: boolean }): void {
		el.isSelected = value;
	}

	@Action
	setSelectedAction({ el, value }: { el: SavedContent; value: boolean }): void {
		this.setSelected({ el, value });
	}

	@Mutation
	unsave(toDelete: SavedContent): void {
		toDelete.isDeleted = true;
		void postOapi("/api/unsave", [new Couple("id", toDelete.fullname)]);
	}

	@Mutation
	unsaveArray(toDelete: SavedContent[]): void {
		toDelete.forEach(el => {
			this.unsave(el);
		});
	}

	@Mutation
	save(toDelete: SavedContent): void {
		toDelete.isDeleted = false;
		void postOapi("/api/save", [new Couple("id", toDelete.fullname)]);
	}

	@Mutation
	saveArray(toDelete: SavedContent[]): void {
		toDelete.forEach(el => {
			this.save(el);
		});
	}
}
