import { logger } from "@/helper/logger";
import { notifyError } from "@/helper/notifierHelper";
import router from "@/router";
import { ElMessage, ElMessageBox } from "element-plus";
import { IMessageOptions } from "element-plus/lib/el-message/src/types";
import { RedditManagerError } from "./error";
import {
	NotifError,
	PartialDownloadError,
	PartialRedditFetchError,
} from "./notifError";
import { RestartError } from "./restartError";

const MESSAGE_DURATION = 10000;

function getMessage(msg: string, html = false): IMessageOptions {
	return {
		message: msg,
		duration: MESSAGE_DURATION,
		showClose: true,
		dangerouslyUseHTMLString: html,
	};
}
export function managerErrors(err: RedditManagerError): void {
	logger.error({
		error: err,
		name: err.name,
		type: err.constructor.name,
		message: err.message,
	});
	if (err instanceof RestartError) {
		void router.push({ name: "Home" });
		ElMessage({ message: err.popupMessage, showClose: true });
	} else if (err instanceof NotifError) {
		if (err instanceof PartialDownloadError) {
			logger.info(PartialDownloadError);
			if (err.success.length === 0) {
				ElMessage(getMessage("The files couldn't be downloaded"));
			} else if (err.fail.length > 0) {
				if (err.fail.length === 1) {
					ElMessage(
						getMessage(`The file ${err.fail[0]} +  couldn't be downloaded`),
					);
				} else {
					const showPopup = () => {
						if (err instanceof PartialDownloadError) {
							let message = "";
							let title = "";
							message = "The following files couldn't be downloaded \n<ul>";
							err.fail.forEach((el) => {
								message += `<li>${el}</li>`;
							});
							message += "</ul>";
							title = "Some files couldn't be downloaded";
							void ElMessageBox({
								message,
								showClose: true,
								dangerouslyUseHTMLString: true,
								title,
							});
						}
					};
					const htmlNode = `Some files couldn't be download  <button type="button" id='buttonNotif'">See which one</button>`;
					const message = ElMessage(getMessage(htmlNode, true));
					const button = document.getElementById("buttonNotif");
					if (!button) {
						throw new Error("PartialDownloadError button not found");
					}
					button.onclick = () => {
						message.close();
						showPopup();
					};
				}
			}
		} else if (err instanceof PartialRedditFetchError) {
			notifyError(`Couldn't fetch the post :${err.name}`);
		} else {
			throw err;
		}
	} else throw err;
}
