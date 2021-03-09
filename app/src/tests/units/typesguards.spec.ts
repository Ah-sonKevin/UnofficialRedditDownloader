import {
	ISavedTextPost,
	hasMedia,
	hasText,
	ISavedCommentPost,
	ISavedGalleryPost,
	ISavedImagePost,
	ISavedLinkPost,
	ISavedVideoPost,
	isComment,
	isGallery,
	isImage,
	isLink,
	isText,
	isVideo,
} from "@/savedContent/ISavedContent";

const video: ISavedVideoPost = {};
const image: ISavedImagePost = {};
const text: ISavedTextPost = {};
const comment: ISavedCommentPost = {};
const link: ISavedLinkPost = {};
const gallery: ISavedGalleryPost = {};

describe("type guard", () => {
	test("isComment", () => {
		expect(isText(comment)).toBe(true);
		expect(isComment(comment)).toBe(false);
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
		expect(isImage(gallery)).toBe(false);
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
			expect(hasMedia(link)).toBe(true);
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
