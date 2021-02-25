/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-statements */
import * as Downloader from "@/helper/Download/objectDownloader";
import HomeDownloadLink from "@homeComponents/HomeDownloadLink.vue";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import ElementPlus from "element-plus";
import nock from "nock";
import { mocked } from "ts-jest/utils";
import item from "./mockFetchData/soloItem.json";

jest.mock("@/helper/Download/objectDownloader");
// const mockDownloader = mocked(Downloader, true); // todo check true

//

describe("HomeDownloadLink", () => {
	const BASE_URL = "www.reddit.com";
	const EXTENSION = "/r/URL"; // todo rename
	const badlyStructuredUrl = `red.com${EXTENSION}`;
	const wellStructuredUrl = BASE_URL + EXTENSION;
	const wellStructuredUrlWithExtension = `${EXTENSION}.json`;

	const VALID_URL = "/r/VALID_URL";
	const INVALID_URL = "/r/INVALID_URL";
	const validUrlWithExtension = `${VALID_URL}.json`;
	const invalidUrlWithExtension = `${INVALID_URL}.json`;
	const fullValidUrl = BASE_URL + VALID_URL;
	const fullInvalidUrl = BASE_URL + INVALID_URL;

	const errorHandler = (err: unknown) => {
		// todo
		/*	if (err instanceof RedditManagerError) {
			managerErrors(err);
		} */
		console.log();
	};

	beforeEach(() => {
		render(HomeDownloadLink, {
			global: {
				plugins: [ElementPlus],
				config: { errorHandler },
			},
		});

		mocked(Downloader.download).mockClear();

		nock(`https://${BASE_URL}`) // todo move
			.get(validUrlWithExtension)
			.reply(200, item)
			.get(validUrlWithExtension)
			.reply(200, item)
			.get(wellStructuredUrlWithExtension) // check how to isolate and test
			.reply(200, item)
			.get(invalidUrlWithExtension)
			.reply(404)
			.persist();
	});

	afterEach(() => {
		if (!nock.isActive()) nock.activate();
	});

	const DOWNLOAD_ERROR_TEXT =
		"The Download fail, please check that this url correspond to a reddit post";
	const STRURCTURE_ERROR_TEXT = "This url is invalid, please enter a valid url";
	// todo doc throwSuggestions (experimental)
	// todo mail fac
	// todo add popup for download error / not testable in unit test
	// todo tooltip or <abbr>
	// todo <aside> ?
	// todo hide token global variable (encrypt ?) (web inspector)
	// todo move nock
	// todo chant wait for end function
	// todo not change when just change value
	// todo change again when new input
	// todo use better links
	// todo use find for specific role
	// todo remove abstraction
	// todo checl change different error message
	// todo test aria message not send when update BAD to bad
	// todo check chjangement error message
	// todo add download error message
	// toremember jest limited access component,
	// toremember should not focus on implementation
	// tocheck check exception
	// tocheck error to check on git/stack

	function updateInput(url: string) {
		const input = screen.getByRole("textbox");
		userEvent.type(input, url); // tocheck
	}
	function submitForm() {
		userEvent.click(screen.getByRole("button", { name: "Download" }));
	}

	describe("Start", () => {
		test("No error on create", () => {
			const errorMessage = screen.getByRole("alert", { hidden: true });
			expect(errorMessage).not.toBeVisible();
		});
	});

	describe("url structure", () => {
		// mock fetch
		describe("Good structure", () => {
			async function assertGoodStructure(url: string) {
				updateInput(url);
				submitForm();
				const structureError = screen.getByRole("alert", {
					hidden: true,
				});
				await waitFor(() =>
					expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1),
				);
				await waitFor(() => expect(structureError).not.toBeVisible());
			}

			test("subreddit url", async () => {
				await assertGoodStructure(VALID_URL);
			});

			test("http://www.reddit.com/r/...", async () => {
				await assertGoodStructure(`http://${BASE_URL}${VALID_URL}`);
			});

			test("https://www.reddit.com/r/...", async () => {
				await assertGoodStructure(`https://${BASE_URL}${VALID_URL}`);
			});

			test("reddit.com/r/...", async () => {
				await assertGoodStructure(`reddit.com${VALID_URL}`);
			});

			test("www.reddit.com/r/...", async () => {
				await assertGoodStructure(`${BASE_URL}${VALID_URL}`);
			});

			test("/r/...", async () => {
				await assertGoodStructure(`${VALID_URL}`);
			});
		});

		describe("Bad structure", () => {
			async function assertBadStructure(url: string) {
				updateInput(url);
				submitForm();
				const structureError = screen.getByRole("alert", {
					// check accessible name in other tests
					hidden: true,
				});

				await waitFor(() => expect(structureError).toBeVisible());
				//	await waitFor(() => expect(getStructureError()).toBeVisible());
			}

			test("end in .json", async () => {
				await assertBadStructure(validUrlWithExtension);
			});

			test("https://www.red.com/r/...", async () => {
				await assertBadStructure(`https://www.re.com${VALID_URL}`);
			});
		});
	});

	describe("Update url", () => {
		test("Badly formed url To Well formed", async () => {
			const input = screen.getByRole("textbox");
			const submitButton = screen.getByRole("button", { name: "Download" });
			userEvent.type(input, badlyStructuredUrl);
			userEvent.click(submitButton);
			const errorMessage = await screen.findByRole("alert");
			await waitFor(() => expect(errorMessage).toBeVisible());
			userEvent.clear(input);
			userEvent.type(input, wellStructuredUrl);
			userEvent.click(submitButton);
			const errorMessage2 = await screen.findByRole("alert");
			await waitFor(() => expect(errorMessage2).not.toBeVisible());
			await waitFor(() =>
				expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1),
			);
		});

		test("Well formed url To badly formed", async () => {
			updateInput(wellStructuredUrl);
			submitForm();
			await waitFor(() =>
				expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1),
			);
			const errorMessage = screen.getByRole("alert", { hidden: true });
			await waitFor(() => expect(errorMessage).not.toBeVisible());
			updateInput(badlyStructuredUrl);
			submitForm();
			const errorMessage2 = await screen.findByRole("alert");
			await waitFor(() => expect(errorMessage2).toBeVisible());
		});
	});

	// toremember : calm down, put things on paper, draw, pause, don't acharne
	describe("url validity", () => {
		test("Valid url", async () => {
			mocked(Downloader.download).mockClear();
			expect(mocked(Downloader.download)).toHaveBeenCalledTimes(0);
			updateInput(fullValidUrl);
			submitForm();
			await waitFor(() =>
				expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1),
			);
			const errorMessage = screen.getByRole("alert", { hidden: true });
			expect(errorMessage).not.toBeVisible();
			expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1);
		});

		test("Invalid url", async () => {
			mocked(Downloader.download).mockReset();
			expect(mocked(Downloader.download)).toHaveBeenCalledTimes(0);
			const errorMessage = screen.getByRole("alert", { hidden: true });
			expect(errorMessage).not.toBeVisible();
			updateInput(fullInvalidUrl);
			submitForm();
			await waitFor(() => expect(errorMessage).toBeVisible());
			expect(mocked(Downloader.download)).toHaveBeenCalledTimes(0);
		});
	});
});
