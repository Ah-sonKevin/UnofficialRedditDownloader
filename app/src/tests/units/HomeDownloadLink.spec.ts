/**
 * @jest-environment jsdom
 */

import * as Downloader from "@/helper/Download/objectDownloader";
import HomeDownloadLink from "@homeComponents/HomeDownloadLink.vue";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import ElementPlus from "element-plus";
import nock from "nock";
import { mocked } from "ts-jest/utils";
import item from "./mockFetchData/soloItem.json";

jest.mock("@/helper/Download/objectDownloader");

describe.skip("HomeDownloadLink", () => {
	const BASE_URL = "www.reddit.com";
	const TEST_URL = "/r/URL";
	const badlyStructuredUrl = `red.com${TEST_URL}`;
	const wellStructuredUrl = BASE_URL + TEST_URL;
	const wellStructuredUrlWithExtension = `${TEST_URL}.json`;

	const VALID_URL = "/r/VALID_URL";
	const INVALID_URL = "/r/INVALID_URL";
	const validUrlWithExtension = `${VALID_URL}.json`;
	const invalidUrlWithExtension = `${INVALID_URL}.json`;
	const fullValidUrl = BASE_URL + VALID_URL;
	const fullInvalidUrl = BASE_URL + INVALID_URL;

	const DOWNLOAD_ERROR_TEXT =
		"The Download fail, please check that this url correspond to a reddit post";
	const STRUCTURE_ERROR_TEXT = "This url is invalid, please enter a valid url";

	beforeAll(() => {
		nock(`https://${BASE_URL}`)
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

	beforeEach(() => {
		render(HomeDownloadLink, {
			global: {
				plugins: [ElementPlus],
			},
		});
		mocked(Downloader.download).mockClear();
		nock.restore();
		nock.activate();
	});

	// later mail fac
	// detail add popup for download error / not testable in unit test ?

	// totest test notif

	function updateInput(url: string) {
		const input = screen.getByRole("textbox");
		userEvent.type(input, url);
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
		describe("Not change on type", () => {
			test("Good to bad", async () => {
				const input = screen.getByRole("textbox");
				const submitButton = screen.getByRole("button", { name: "Download" });
				userEvent.type(input, wellStructuredUrl);
				userEvent.click(submitButton);
				const errorMessage = screen.getByRole("alert", { hidden: true });
				await waitFor(() =>
					expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1),
				);
				await waitFor(() => expect(errorMessage).not.toBeVisible());
				userEvent.clear(input);
				userEvent.type(input, badlyStructuredUrl);
				expect(errorMessage).not.toBeVisible();
			});

			test("Bad to good", async () => {
				const input = screen.getByRole("textbox");
				const submitButton = screen.getByRole("button", { name: "Download" });
				userEvent.type(input, badlyStructuredUrl);
				userEvent.click(submitButton);
				const errorMessage = await screen.findByRole("alert");
				await waitFor(() => expect(errorMessage).toBeVisible()); // tocheckonrun await ?
				userEvent.clear(input);
				userEvent.type(input, wellStructuredUrl);
				expect(errorMessage).toBeVisible();
			});
		});

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

		test("Error to another type error", async () => {
			const input = screen.getByRole("textbox");
			const submitButton = screen.getByRole("button", { name: "Download" });
			userEvent.type(input, badlyStructuredUrl);
			userEvent.click(submitButton);
			const errorMessage = await screen.findByRole("alert", {
				name: STRUCTURE_ERROR_TEXT,
			});
			await waitFor(() => expect(errorMessage).toBeVisible());
			userEvent.clear(input);
			userEvent.type(input, fullValidUrl);
			userEvent.click(submitButton);
			const errorMessage2 = await screen.findByRole("alert", {
				name: DOWNLOAD_ERROR_TEXT,
			});
			await waitFor(() => expect(errorMessage2).toBeVisible());
			await waitFor(() =>
				expect(mocked(Downloader.download)).toHaveBeenCalledTimes(1),
			);
		});
	});

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

	describe("Download Error", () => {});
});
