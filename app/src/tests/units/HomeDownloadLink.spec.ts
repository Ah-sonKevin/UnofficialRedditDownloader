/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-statements */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-console */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-call */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as Downloader from "@/helper/Download/objectDownloader";
import HomeDownloadLink from "@homeComponents/HomeDownloadLink.vue";
import { render, screen, waitFor } from "@testing-library/vue";
import ElementPlus from "element-plus";
import nock from "nock";
import { mocked } from "ts-jest/utils";
import { getWrapper } from "../wrapperFactory";
import item from "./mockFetchData/soloItem.json";

// todo updates reddit data
const mockRouter = {
	push: jest.fn(),
};
jest.mock("@/helper/Download/objectDownloader");
const mockDownloader = mocked(Downloader, true); // todo check true

describe("HomeDownloadLink", () => {
	const BASE_URL = "https://www.reddit.com";
	const VALID_URL =
		"/r/announcements/comments/hrrh23/now_you_can_make_posts_with_multiple_images/";
	const INVALID_URL = "/r/URL";

	beforeAll(() => {
		nock(BASE_URL)
			.get(/.*\.json/)
			.reply(200, item)
			.persist();
	});

	describe("Start", () => {
		test("No error on create", () => {
			const wrapper = getWrapper(HomeDownloadLink);
			expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
		});
	});

	// todo show format possible
	describe("url structure", () => {
		describe("Good structure", () => {
			// todo hide token global variable (encrypt ?)
			test("subreddit url", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/",
				); // tocheck
				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			});

			test("http://www.reddit.com/r/...", async () => {
				// todo
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					// todo
					"http://www.reddit.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/", // todo other url
				); // tocheck

				const button = wrapper.find("#formButton");
				await button.trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			});

			test("https://www.reddit.com/r/...", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"https://www.reddit.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/",
				); // tocheck

				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			});

			test("reddit.com/r/...", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"reddit.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/",
				); // tocheck
				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			});

			test("www.reddit.com/r/...", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"www.reddit.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/",
				); // tocheck
				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			});

			test("/r/...", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/",
				); // tocheck
				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			});
		});

		describe("Bad structure", () => {
			test("end in .json", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"http://www.reddit.com/r/programminghorror/comments/lhq9bv/microsoft_word.json",
				);
				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(true);
			});

			test("https://www.red.com/r/...", async () => {
				const wrapper = getWrapper(HomeDownloadLink);
				const input = wrapper.find("#inputText");
				await input.setValue(
					"https://www.re.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/",
				);
				await wrapper.find("#formButton").trigger("click");
				expect(wrapper.find("#errorMessage").isVisible()).toBe(true);
			});
		});
	});

	describe("Update url", () => {
		// todo not change when just change value
		// todo change again when new input
		// todo use better links
		const BAD_URL =
			"reddi.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/";
		const GOOD_URL =
			"reddit.com/r/programminghorror/comments/lhq9bv/microsoft_word_is_the_best_coding_ide/";

		test("Badly formed url To Well formed", async () => {
			const wrapper = getWrapper(HomeDownloadLink);
			const input = wrapper.find("#inputText");
			await input.setValue(); // tocheck
			await wrapper.find("#formButton").trigger("click");
			expect(wrapper.find("#errorMessage").isVisible()).toBe(true);
			await input.setValue(GOOD_URL); // tocheck
			await wrapper.find("#formButton").trigger("click");
			expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
		});

		test("Well formed url To badly formed", async () => {
			// tochange
			// todo use const
			const wrapper = getWrapper(HomeDownloadLink);
			const input = wrapper.find("#inputText");
			await input.setValue(GOOD_URL); // tocheck
			await wrapper.find("#formButton").trigger("click");
			expect(wrapper.find("#errorMessage").isVisible()).toBe(false);
			await input.setValue(BAD_URL); // tocheck
			await wrapper.find("#formButton").trigger("click");
			expect(wrapper.find("#errorMessage").isVisible()).toBe(true);
		});
	});

	// torembmer jest limitecd access compoennt,
	// should not focus on implementation
	// tocheck check exception
	// todo chant wait for end function
	// wait for event
	// todo mauybe extract function
	describe("url validity", () => {
		test("Invalid url", async () => {
			const wrapper = getWrapper(HomeDownloadLink);

			render(HomeDownloadLink, {
				global: { plugins: [ElementPlus] },
			});
			// todo get by role
			const input = wrapper.find("#inputText");
			await input.setValue(INVALID_URL);

			//	console.log(screen.getByPlaceholderText("Enter item's URL"));
			console.log(screen.getByPlaceholderText("Enter item's URL"));

			// todo template throw unvalidate error
			/*	expect(async () => wrapper.find("#formButton").trigger("click")).toThrow(
				DownloadError,
			); */
			// todo errors
			expect(mockDownloader.download).not.toHaveBeenCalled();
			expect(wrapper.find("#errorMessage").isVisible()).toBe(true);
		});

		test("Valid url", async () => {
			const wrapper = getWrapper(HomeDownloadLink);
			const input = wrapper.find("#inputText");
			await input.setValue(VALID_URL);
			await wrapper.find("#formButton").trigger("click");
			await waitFor(() => expect(mockDownloader.download).toHaveBeenCalled());
		});
	});
});
// todo check if error ?
// todo extract function
// tocheck test speed
