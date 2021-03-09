/**
 * @jest-environment jsdom
 */
import {
	hasMedia,
	hasText,
	isComment,
	isGallery,
	isImage,
	isLink,
	isText,
	isVideo,
} from "@/savedContent/ISavedContent";
import { buildContent } from "@/savedContent/ItemBuilder/contentBuilder";
import { SavedContentType } from "../../savedContent/ISavedContent";
import _comment from "./mockFetchData/soloItem/comment/comment.json";
import _gallery from "./mockFetchData/soloItem/gallery/gallery.json";
import _image from "./mockFetchData/soloItem/image/image.json";
import _link from "./mockFetchData/soloItem/link/link.json";
import _text from "./mockFetchData/soloItem/text.json";
import _video from "./mockFetchData/soloItem/video/video.json";

let video: SavedContentType;
let image: SavedContentType;
let text: SavedContentType;
let comment: SavedContentType;
let link: SavedContentType;
let gallery: SavedContentType;

beforeAll(async () => {
	video = await buildContent(_video);
	image = await buildContent(_image);
	comment = await buildContent(_comment);
	text = await buildContent(_text);
	link = await buildContent(_link);
	gallery = await buildContent(_gallery);
});

describe("type guard", () => {
	test("isComment", () => {
		expect(isText(comment)).toBe(false);
		expect(isComment(comment)).toBe(true);
		expect(isImage(comment)).toBe(false);
		expect(isVideo(comment)).toBe(false);
		expect(isGallery(comment)).toBe(false);
		expect(isLink(comment)).toBe(false);
	});

	test("isText", () => {
		expect(isText(text)).toBe(true);
		expect(isComment(text)).toBe(false);
		expect(isImage(text)).toBe(false);
		expect(isVideo(text)).toBe(false);
		expect(isGallery(text)).toBe(false);
		expect(isLink(text)).toBe(false);
	});

	test("isGallery", () => {
		expect(isText(gallery)).toBe(false);
		expect(isComment(gallery)).toBe(false);
		expect(isImage(gallery)).toBe(true); // tocheck
		expect(isVideo(gallery)).toBe(false);
		expect(isGallery(gallery)).toBe(true);
		expect(isLink(gallery)).toBe(false);
	});

	test("isImage", () => {
		expect(isText(image)).toBe(false);
		expect(isComment(image)).toBe(false);
		expect(isImage(image)).toBe(true);
		expect(isVideo(image)).toBe(false);
		expect(isGallery(image)).toBe(false);
		expect(isLink(image)).toBe(false);
	});

	test("isLink", () => {
		expect(isText(link)).toBe(false);
		expect(isComment(link)).toBe(false);
		expect(isImage(link)).toBe(false);
		expect(isVideo(link)).toBe(false);
		expect(isGallery(link)).toBe(false);
		expect(isLink(link)).toBe(true);
	});

	test("isVideo", () => {
		expect(isText(video)).toBe(false);
		expect(isComment(video)).toBe(false);
		expect(isImage(video)).toBe(false);
		expect(isVideo(video)).toBe(true);
		expect(isGallery(video)).toBe(false);
		expect(isLink(video)).toBe(false);
	});

	describe("Union type", () => {
		test("hasMedia", () => {
			expect(hasMedia(video)).toBe(true);
			expect(hasMedia(image)).toBe(true);
			expect(hasMedia(text)).toBe(false);
			expect(hasMedia(comment)).toBe(false);
			expect(hasMedia(link)).toBe(false); // tocheck
			expect(hasMedia(gallery)).toBe(true);
		});

		test("hasText", () => {
			expect(hasText(video)).toBe(false);
			expect(hasText(image)).toBe(false);
			expect(hasText(text)).toBe(true);
			expect(hasText(comment)).toBe(true);
			expect(hasText(link)).toBe(false);
			expect(hasText(gallery)).toBe(false);
		});
	});
});
