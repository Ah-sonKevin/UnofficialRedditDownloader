import User from "@/User/User";
import userJson from "./mockFetchData/user.json";

describe("User", () => {
	test("Creaction", () => {
		const user = new User(userJson);
		expect(user).toEqual({
			name: "NAME",
			id: "ID",
			isGold: false,
		});
	});
});
