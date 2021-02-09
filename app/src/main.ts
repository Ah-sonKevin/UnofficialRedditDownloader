import { managerErrors } from "@/errors/manageError";
import router from "@/router";
import { store } from "@/store";
import App from "@/views/App.vue";
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";
import { createApp } from "vue";
import { RedditManagerError } from "./errors/error";

const app = createApp(App);
app
	.use(store)
	.use(router)
	.use(ElementPlus)
	.mount("#app");

window.onunhandledrejection = (promiseEvent: PromiseRejectionEvent) => {
	const error: unknown = promiseEvent.reason;
	if (error instanceof RedditManagerError) {
		promiseEvent.preventDefault();
		managerErrors(error);
	} else {
		throw error;
	}
};

app.config.errorHandler = (err: unknown) => {
	if (err instanceof RedditManagerError) {
		managerErrors(err);
	}
};
