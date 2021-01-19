import router from "@/router";
import { ElMessage, ElMessageBox } from "element-plus";
import { R_Error } from "./error";
import { R_ErrorLight } from "./errorLight";

const messageDuration = 10000;

export function managerErrors(err: Error): void {
  if (err instanceof R_Error) {
    ElMessageBox.alert(
      (err as R_Error).popupMessage +
        "\n" +
        err.postErrorTxt +
        "\n" +
        "You will be redirected to the homepage",
      err.name,
      {
        callback: () => {
          router.push({ name: "Home" });
        }
      }
    );
  } else if (err instanceof R_ErrorLight) {
    if (err.popup) {
      const option = err.html ? { dangerouslyUseHTMLString: true } : {};
      ElMessageBox.alert(err.message, err.title, option);
    } else {
      ElMessage.info({
        type: "info",
        message: err.message,
        duration: messageDuration
      });
    }
    if (err.redirect) {
      router.push({ name: "Home" });
    }
  } else throw err;
}
