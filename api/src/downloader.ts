import ffmpeg from "fluent-ffmpeg";
import { createReadStream, createWriteStream, unlink } from "fs";
import fetch from "node-fetch";
import { isMultiChannel, isOneChannel, ItemInfo, oneChannelItemInfo } from './interface/itemInfo';

export { }; //todo needed for module with its own scope
require("express-zip");

const basePath = "media/";

export async function download(item : oneChannelItemInfo) : Promise<NodeJS.ReadableStream> { //tocheck type
  const res = await fetch(item.url)
  return (res.body);
}

export function cleanString(text:string) {
  return text
    .replace(/\W/gi, "_")
    .replace(/_+/gi, "_")
    .replace(/^_/, "")
    .replace(/_$/, "");
}

export async function youtubeDlDownload(itemInfo: ItemInfo): Promise<NodeJS.ReadableStream> {

  return new Promise((promise, reject) => {
    let videoStreamDone = false;
    let audioStreamDone = false;
    let audioExt = "";
    let videoExt = "";
    let audioNameFile = "";
    let videoNameFile = "";

    function streamMerge() {
      if (videoStreamDone && audioStreamDone) {
        const nameFile = `${basePath}${itemInfo.name}.${videoExt}`;
        const clean = () => {
          unlink(videoNameFile, () => {});
          unlink(audioNameFile, () => {});
        };
        ffmpeg()
          .addInput(videoNameFile)
          .addInput(audioNameFile)
          .audioCodec("copy")
          .videoCodec("copy")
          .saveToFile(nameFile) // cant directly output stream for mp4 format
          .on("error", (err: Error) => {
            clean();
            reject(err);
          })
          .on("end", () => {
            clean();
            const stream = createReadStream(nameFile)
              .on("error", () => {
                unlink(nameFile, () => {});
                reject();
                stream.destroy();
              })
              .on("close", () => {
                unlink(nameFile, () => {});
              })
              .on("open", () => {
                promise(stream.pause());
              });
          });
      }
    }

    if (isOneChannel(itemInfo)) {
      fetch(itemInfo.url)
        .then((res) => {
          if (res.ok) {
            promise(res.body);
          } else {
            reject();
          }
        })
        .catch((err: Error) => reject(err));
    } else if(isMultiChannel(itemInfo)) {
      videoExt = itemInfo.video.ext;
      audioExt = itemInfo.audio.ext;
      videoNameFile = `${basePath}${cleanString(
        itemInfo.name
      )}_video.${cleanString(videoExt)}`;
      audioNameFile = `${basePath}${cleanString(
        itemInfo.name
      )}_audio.${cleanString(audioExt)}`;

      fetch(itemInfo.video.url)
        .then((respVideo) => {
          if (respVideo.ok) {
            fetch(itemInfo.audio.url)
              .then((respAudio) => {
                if (respAudio) {
                  respVideo.body
                    .pipe(
                      createWriteStream(videoNameFile)
                        .on("finish", () => {
                          videoStreamDone = true;
                          streamMerge();
                        })
                        .on("error", (err: Error) => {
                          reject(err);
                        })
                    )
                    .on("error", (err: Error) => {
                      reject(err);
                    });

                  respAudio.body
                    .pipe(
                      createWriteStream(audioNameFile)
                        .on("finish", () => {
                          audioStreamDone = true;
                          streamMerge();
                        })
                        .on("error", (err: Error) => {
                          reject(err);
                        })
                    )
                    .on("error", (err: Error) => {
                      reject(err);
                    });
                } else {
                  reject();
                }
              })
              .catch((err: Error) => reject(err));
          } else {
            reject();
          }
        })
        .catch((err: Error) => reject(err));
    } else {
      throw new Error('Invalid item info')
    }
  });
}

export function downloader(itemInfo: ItemInfo ):Promise<NodeJS.ReadableStream> {
  if (itemInfo.needYoutubeDl) {
    return youtubeDlDownload(itemInfo);
  }
  if(isOneChannel(itemInfo)){
    return download(itemInfo);
  } else {
    return Promise.reject(new Error('Invalid download info')) //check structure
  }
}