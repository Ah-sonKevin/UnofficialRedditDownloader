import { postType } from "@/enum/postType";
import {
  R_DownloadError,
  R_NetworkError,
  R_UnknowTypeError,
} from "@/errors/restartError";
import SavedContent from "@/object/savedContent";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import { loadAsync } from "jszip";
import { R_PartialDownloadError } from "../errors/notifError";
import { fetchBatchMediaInfo, fetchMedia } from "./fetchHelper";
import { ItemInfo, SuccessList } from "./ItemInterface";
import { notify } from "./notifier";
import { cleanString } from "./stringHelper";

let downloading = false;

function cancelDownload() {
  notify("Download Canceled");
  downloading = false;
}

function getName(text: string, extension: string): string {
  return `${cleanString(text)}.${extension}`;
}
// tocheck lint staged
function downloadPageAsText(item: SavedContent): void {
  const parser = new DOMParser();

  const parsedContent = parser.parseFromString(item.htmlText, "text/html");
  const stringContent = parsedContent.documentElement.textContent;

  let res = "";
  if (item.type === postType.COMMENT) {
    res = `A comment  by '${item.author}' of the post '${item.title}' by '${
      item.author
    }' from
         ${item.subreddit} at ${item.redditUrl} \n\n\n\n ${stringContent ??
      ""}`;
  } else {
    res = `'${item.title}' by '${item.author}' from ${item.subreddit} at ${
      item.redditUrl
    } \n\n\n\n ${stringContent ?? ""}`;
  }

  downloadObject(new Blob([res]), getName(item.title, "html"));
}

function startDownload(x: Response) {
  let length = x.headers.get("Content-Length");
  if (!length) {
    console.log("LengthError");
    // return;
    length = "1";
  }
  const BYTE_SIZE = 8;
  const ordreDeGrandeur = Math.floor(length.length / 3);
  const divider = BYTE_SIZE * ordreDeGrandeur * 1000;
  let extension = "";
  switch (ordreDeGrandeur) {
    case 0:
      extension = "B";
      break;
    case 1:
      extension = "kB";
      break;
    case 2:
      extension = "mB";
      break;
    case 3:
      extension = "gB";
      break;
    default: {
      console.log("Size error");
      throw new R_DownloadError();
    }
  }
  return { divider, extension, length: +length };
}
//
function updateDownloadSpinner(
  downloadIndicator: ILoadingInstance,
  receivedData: number,
  totalData: number,
  divider: number,
  extension: string,
) {
  downloadIndicator.setText(
    `Downloading : ${String(receivedData / divider)}/${String(
      totalData / divider,
    )} ${extension}`,
  );
}

async function fetchData(
  x: Response,
  downloadIndicator: ILoadingInstance,
  name: string,
) {
  // downloading= true
  if (x.ok) {
    const tmpRes = startDownload(x);

    const { divider, extension, length } = tmpRes || {
      divider: 1,
      extension: "",
      length: 1,
    };

    const fileChunks: Uint8Array[] = [];
    let receivedData = 0;
    const totalData: number = length;
    const reader = x.body?.getReader();
    if (!reader) {
      console.log("Bad response");
      downloadIndicator.close();
      throw new R_DownloadError();
    }
    let reading = true;
    const updateSpinner = setInterval(() => {
      if (tmpRes) {
        updateDownloadSpinner(
          downloadIndicator,
          receivedData,
          totalData,
          divider,
          extension,
        );
      } else {
        downloadIndicator.setText("Downloading ...");
      }
    }, 1000);
    while (reading && downloading) {
      // replace no for loop
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
      } else {
        if (!value) {
          console.log("BadValue");
          downloadIndicator.close();
          throw new R_DownloadError();
        }
        fileChunks.push(value);
        receivedData += value.length;
      }
    }

    downloadIndicator.close();
    clearInterval(updateSpinner);
    if (downloading) {
      const file = new Blob(fileChunks);
      downloadObject(file, name);
      return file;
    }
    return undefined;
  }
  downloadIndicator.close();
  console.log("Bad response");
  throw new R_DownloadError();
}

async function downloadMedia(item: SavedContent) {
  const downloadIndicator = ElLoading.service({
    fullscreen: true,
    text: "Download Preparation",
    target: "#topArea",
  });

  const url = item.externalUrl;
  const x = await fetchMedia(url, item.needYtDl);
  await fetchData(
    x,
    downloadIndicator,
    getName(item.title, url.split(".").slice(-1)[0]),
  );
}

function downloadObject(object: Blob, nom: string): void {
  const img = URL.createObjectURL(object);
  const linkDown = document.createElement("a");
  linkDown.href = img;
  linkDown.setAttribute("download", nom);
  linkDown.click();
  linkDown.remove();
  URL.revokeObjectURL(img);
}

function getURL(
  item: SavedContent,
): { url: string; name: string; needYtDl: boolean; folder: string } {
  if (item.isGallery) {
    throw Error("Need Batch Download");
  }
  if (
    item.type === postType.COMMENT ||
    item.type === postType.TEXT ||
    item.type === postType.LINK
  ) {
    return {
      url: item.externalUrl,
      name: getName(item.title, "html"),
      folder: "",
      needYtDl: false,
    };
  }
  return {
    url: item.externalUrl,
    // name: getName(item.title, item.externalUrl.split(".").slice(-1)[0]),
    name: cleanString(item.title),
    folder: "",
    needYtDl: item.needYtDl,
  };
}

function getBatchUrl(item: SavedContent): ItemInfo[] {
  if (item.isGallery) {
    return item.galleryURLs.map((el, index) => {
      return {
        url: el,
        name: getName(
          `${item.title}_${String(index + 1)}`,
          el.split(".").slice(-1)[0],
        ),
        folder: cleanString(item.title),
        needYtDl: item.needYtDl,
      };
    });
  }
  return [getURL(item)];
}

export function download(items: SavedContent | SavedContent[]): void {
  if (Array.isArray(items)) {
    if (items.length === 1) {
      void singleDownload(items[0])
        .then(() => {
          downloading = false;
          return downloading;
        })
        .catch(err => console.log(err));
    } else {
      void batchDownload(items).then(() => {
        downloading = false;
        return downloading;
      });
    }
  } else {
    void singleDownload(items).then(() => {
      downloading = false;
      return downloading;
    });
  }
}

// todo check batch text
export async function batchDownload(items: SavedContent[]): Promise<void> {
  downloading = true;
  console.log(`batchDownload :  + ${items.length}`);

  const downloadIndicator = ElLoading.service({
    fullscreen: true,
    text: "Download Preparation",
    target: "#topArea",
  });

  const urls: {
    url: string;
    name: string;
    needYtDl: boolean;
    folder: string;
  }[] = [];
  items.forEach(el => {
    urls.push(...getBatchUrl(el));
  });

  // todo empty screen list
  const x = await fetchBatchMediaInfo(urls);
  const blob = await fetchData(x, downloadIndicator, "a.zip");

  if (blob) {
    void loadAsync(blob)
      .then(el => el.files["result.json"].async("string"))
      .then(res => {
        // tocheck eslint disabled line eslint-disable
        const arrays = JSON.parse(res) as SuccessList;
        if (arrays.fail.length > 0) {
          throw new R_PartialDownloadError(arrays);
        }
        return arrays;
      });
  } else {
    throw new R_NetworkError(x.statusText);
  }
}

export async function singleDownload(item: SavedContent): Promise<void> {
  downloading = true;
  const itemType: string = item.type;
  if (item.isGallery) {
    await batchDownload([item]);
  } else if (
    itemType === postType.TEXT ||
    itemType === postType.LINK ||
    itemType === postType.COMMENT
  ) {
    downloadPageAsText(item);
    downloading = false;
  } else if (itemType === postType.IMAGE || itemType === postType.VIDEO) {
    await downloadMedia(item);
  } else {
    throw new R_UnknowTypeError(`Unknow type ${itemType}  ${item.title}`);
  }
}
