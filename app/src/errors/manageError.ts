import router from "@/router";
import { ElMessage, ElMessageBox } from "element-plus";
import { IMessageOptions } from "element-plus/lib/el-message/src/types";
import { R_Error } from "./error";
import { R_NotifError, R_PartialDownloadError } from "./notifError";
import { R_RestartError } from "./restartError";

const messageDuration = 10000;

function getMessage(msg: string, html = false): IMessageOptions {
	return {
		message: msg,
		duration: messageDuration,
		showClose: true,
		dangerouslyUseHTMLString: html,
	};
}
export function managerErrors(err: R_Error): void {
	console.log(err);
	if (err instanceof R_RestartError) {
		void router.push({ name: "Home" });
		ElMessage({ message: err.popupMessage, showClose: true });
	} else if (err instanceof R_NotifError) {
		if (err instanceof R_PartialDownloadError) {
			if (err.success.length === 0) {
				ElMessage(getMessage("The files couldn't be downloaded"));
			} else if (err.fail.length > 0) {
				if (err.fail.length === 1) {
					ElMessage(
						getMessage(
							`The file ${err.fail[0].name} +  couldn't be downloaded`,
						),
					);
				} else {
					const showPopup = () => {
						if (err instanceof R_PartialDownloadError) {
							let message = "";
							let title = "";
							message = "The following files couldn't be downloaded \n<ul>";
							err.fail.forEach(el => {
								message += `<li>${el.name}</li>`;
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
					ElMessage(
						getMessage(
							"Some files couldn't be download <el-button onclick=\"showPopup()\" > See which one </el-button> ", // tocheck
							true,
						),
					);
				}
			}
		} else {
			throw err;
		}
	} else throw err;
}
