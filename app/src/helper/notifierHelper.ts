import { ElMessage } from "element-plus";

const DURATION = 5000;

export function notify(msg: string): void {
	ElMessage({ message: msg, type: "info", duration: DURATION });
}

export function notifyError(msg: string): void {
	ElMessage({ message: msg, type: "error", duration: DURATION });
}
// todo handle limit 601/call api / s
