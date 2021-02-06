import { cleanString } from "@/helper/stringHelper";

describe("Get name function", () => {
	test("Clean not alphanumeric character", () => {
		const INPUT = "This is^a$test;3";
		const OUTPUT = "This_is_a_test_3";
		expect(cleanString(INPUT)).toBe(OUTPUT);
	});

	test("Don't terminate by '_' or ' '", () => {
		const input = ["This_is_a_test_", "This_is_a_test$"];
		const OUTPUT = "This_is_a_test";
		input.forEach(el => expect(cleanString(el)).toBe(OUTPUT));
	});

	test("Don't start by '_' or ' '", () => {
		const input = ["_This_is_a_test", "$This_is_a_test"];
		const OUTPUT = "This_is_a_test";
		input.forEach(el => expect(cleanString(el)).toBe(OUTPUT));
	});

	test("No successive '_'", () => {
		const input = ["This_$_is_a___test", "$This$$is$*_a   test"];
		const OUTPUT = "This_is_a_test";
		input.forEach(el => expect(cleanString(el)).toBe(OUTPUT));
	});
});
