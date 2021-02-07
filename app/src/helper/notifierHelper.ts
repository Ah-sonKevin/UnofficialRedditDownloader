import { ElMessage } from "element-plus";

export function notify(msg: string): void {
	ElMessage.info(msg);
}

export function notifyError(msg: string): void {
	ElMessage.error(msg);
}
