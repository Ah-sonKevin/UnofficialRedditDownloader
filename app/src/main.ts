import { managerErrors } from "@/errors/manageError";
import router from "@/router";
import { store } from "@/store";
import App from "@/views/App.vue";
import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";
import { createApp } from "vue";
import { R_Error } from "./errors/error";

const app = createApp(App);
app
	.use(store)
	.use(router)
	.use(ElementPlus)
	.mount("#app");
// todo textContent/MEdiaContent class

window.onunhandledrejection = (promiseEvent: PromiseRejectionEvent) => {
	const error: unknown = promiseEvent.reason;
	if (error instanceof R_Error) {
		promiseEvent.preventDefault(); // message still show on firefox, bug
		managerErrors(error);
	} else {
		throw error;
	}
};

app.config.errorHandler = (err: unknown) => {
	if (err instanceof Error) {
		managerErrors(err);
	}
};
