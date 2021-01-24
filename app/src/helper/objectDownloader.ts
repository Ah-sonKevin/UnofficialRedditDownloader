/* eslint-disable no-magic-numbers */

import { postType } from "@/enum/postType";
import {
  R_DownloadError,
  R_NetworkError,
  R_UnknowTypeError
} from "@/errors/restartError";
import SavedContent from "@/object/savedContent";
import { ElLoading } from "element-plus";
import { ILoadingInstance } from "element-plus/lib/el-loading/src/loading.type";
import { fetchBatchMediaInfo, fetchMedia } from "./fetchHelper";

function cleanString(text: string) {
  //no ' !!
  return text.replace(/\W/gi, "_");
}
function getName(text: string, extension: string): string {
  return cleanString(text) + "." + extension;
}

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
  const length = x.headers.get("Content-Length");
  if (!length) {
    console.log("LengthError");
    return;
  }
  const byteSize = 8;
  const ordreDeGrandeur = Math.floor(length.length / 3);
  const divider = byteSize * ordreDeGrandeur * 1000;
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
  extension: string
) {
  downloadIndicator.setText(
    "Downloading : " +
      String(receivedData / divider) +
      "/" +
      String(totalData / divider) +
      " " +
      extension
  );
}

async function fetchData(
  x: Response,
  downloadIndicator: ILoadingInstance,
  name: string
) {
  if (x.ok) {
    const tmpRes = startDownload(x);
    console.log("started");

    const { divider, extension, length } = tmpRes
      ? tmpRes
      : { divider: 1, extension: "", length: 1 };

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
          extension
        );
      } else {
        downloadIndicator.setText("Downloading ...");
      }
    }, 1000);
    while (reading) {
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

    downloadObject(new Blob(fileChunks), name);
    downloadIndicator.close();
    clearInterval(updateSpinner);
  } else {
    downloadIndicator.close();
    console.log("Bad response");
    throw new R_DownloadError();
  }
}

async function downloadMedia(item: SavedContent) {
  const time = new Date().getTime();
  console.log("Download Image");
  const downloadIndicator = ElLoading.service({
    fullscreen: true,
    text: "Download Preparation"
  });

  const url = item.externalUrl;
  console.log(url);
  console.log("fetchmedia");
  const x = await fetchMedia(url, item.needYtDl);
  console.log("fetch data");
  await fetchData(
    x,
    downloadIndicator,
    getName(item.title, url.split(".").slice(-1)[0])
  );
  console.log(new Date().getTime() - time);
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
  item: SavedContent
): { url: string; name: string; needYtDl: boolean; folder: string } {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  console.log(item.title + "   " + item.needYtDl);
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
      needYtDl: false
    };
  } else {
    return {
      url: item.externalUrl,
      // name: getName(item.title, item.externalUrl.split(".").slice(-1)[0]),
      name: cleanString(item.title),
      folder: "",
      needYtDl: item.needYtDl
    };
  }
}
//todo unit test (ex clean name function )

function getBatchUrl(
  item: SavedContent
): { url: string; name: string; needYtDl: boolean; folder: string }[] {
  if (item.isGallery) {
    return item.galleryURLs.map((el, index) => {
      return {
        url: el,
        name: getName(
          item.title + "_" + String(index + 1), //todo format nale
          el.split(".").slice(-1)[0]
        ),
        folder: cleanString(item.title),
        needYtDl: item.needYtDl
      };
    });
  } else {
    return [getURL(item)];
  }
}

export function download(items: SavedContent | SavedContent[]): void {
  console.log("DOwnload");
  if (Array.isArray(items)) {
    if (items.length === 0) {
      return; //todo
    } else if (items.length === 1) {
      void singleDownload(items[0]);
    } else {
      console.log("batch");
      void batchDownload(items);
    }
  } else {
    void singleDownload(items);
  }
}

//todo check batch text
export async function batchDownload(items: SavedContent[]): Promise<void> {
  console.log(`batchDownload :  + ${items.length}`);

  const downloadIndicator = ElLoading.service({
    fullscreen: true,
    text: "Download Preparation"
  });
  //todo ux show list selected
  const urls: {
    url: string;
    name: string;
    needYtDl: boolean;
    folder: string;
  }[] = [];
  items.forEach(el => {
    urls.push(...getBatchUrl(el));
  });
  console.log(urls);
  console.log("GotUrl");
  const x = await fetchBatchMediaInfo(urls);
  void fetchData(x, downloadIndicator, "a.zip");
  if (x.ok) {
    console.log("GotMediaInfo");
    console.log(x);
    /*const arrays: {
      success: { path: string; name: string }[];
      fail: { path: string; name: string }[];
    } = await x.json();
    console.log("GotJson");
    console.log(arrays);
    if (arrays.success.length > 0) {
      const res = await fetchBatchMediaFile(arrays.success);
      await fetchData(res, downloadIndicator, getName("archive", ".zip"));
    } else {
      throw new R_PartialDownloadError(arrays);
    }*/
  } else {
    throw new R_NetworkError(x.statusText);
  }
}

export function singleDownload(item: SavedContent): void {
  const itemType: string = item.type;
  if (item.isGallery) {
    void batchDownload([item]);
  } else if (
    itemType === postType.TEXT ||
    itemType === postType.LINK ||
    itemType === postType.COMMENT
  ) {
    downloadPageAsText(item);
  } else if (itemType === postType.IMAGE || itemType === postType.VIDEO) {
    void downloadMedia(item);
  } else {
    throw new R_UnknowTypeError("Unknow type " + itemType + "  " + item.title); //todo switch without default
  }
}
