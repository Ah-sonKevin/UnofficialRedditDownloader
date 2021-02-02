import { ElMessage } from "element-plus";

export function notify(msg: string): void {
	ElMessage.info(msg);
}
