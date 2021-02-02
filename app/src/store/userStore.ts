import { DataNotFoundError } from "@/errors/restartError";
import User from "@/User/User";
import { Module, Mutation, VuexModule } from "vuex-module-decorators";

// @Module({ dynamic: true, store, name: 'user' })
@Module({ name: "user" })
export default class UserStore extends VuexModule {
	user?: User = undefined;

	@Mutation
	setUser(u: User): void {
		this.user = u;
	}

	get isGold(): boolean {
		return this.getUser.isGold;
	}

	get getUser(): User {
		if (!this.user) throw new DataNotFoundError("Undefined User");
		return this.user;
	}
}
