import { ElMessage } from 'element-plus';

export function notify(msg: string) {
  ElMessage.info(msg);
}
