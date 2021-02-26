import About from "@/views/About.vue";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Manager from "@/views/Manager.vue";
import NotFound from "@/views/NotFound.vue";
import {
	createRouter,
	createWebHistory,
	Router,
	RouteRecordRaw
} from "vue-router";
import { getTypedStore } from "../store/index";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/manager",
		component: Manager,
		name: "Manager",
		props: true,
		beforeEnter() {
			const store = getTypedStore();
			if (store.getters.isConnected) {
				return true;
			}
			return { name: "Home" };
		},
	},
	{
		path: "/login",
		component: Login,
		name: "Login",
		beforeEnter(to) {
			const query = to.query;
			if (query && query.state && query.code && !query.error) {
				return true;
			}
			return { name: "Home" };
		},
	},

	{
		path: "/about",
		name: "About",
		component: About,
	},
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/:path(.*)*",
		name: "notFound",
		component: NotFound,
	},
];

let router: Router;

export function makeRouter(): Router {
	router = createRouter({
		history: createWebHistory(),
		routes,
	});
	return router;
}

export function getRouter(): Router {
	if (router) {
		return router;
	}
	throw new Error("Missing router");
}
