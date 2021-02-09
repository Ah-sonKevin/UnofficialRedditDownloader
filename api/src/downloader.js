const { createWriteStream, createReadStream, unlink } = require("fs");
require("express-zip");
const fetch = require("node-fetch").default;
const ffmpeg = require("fluent-ffmpeg");

const basePath = "media/";

function download(uri) {
  return fetch(uri);
}

async function youtubeDlDownload(itemInfo) {
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
          .on("error", (err) => {
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

    if (itemInfo.isOneFile) {
      fetch(itemInfo.url)
        .then((res) => {
          if (res.ok) {
            promise(res.body);
          } else {
            reject();
          }
        })
        .catch((err) => reject(err));
    } else {
      videoExt = itemInfo.video.ext;
      audioExt = itemInfo.audio.ext;
      videoNameFile = `${basePath}${itemInfo.name}_video.${videoExt}`;
      audioNameFile = `${basePath}${itemInfo.name}_audio.${audioExt}`;

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
                        .on("error", (err) => {
                          reject(err);
                        })
                    )
                    .on("error", (err) => {
                      reject(err);
                    });

                  respAudio.body
                    .pipe(
                      createWriteStream(audioNameFile)
                        .on("finish", () => {
                          audioStreamDone = true;
                          streamMerge();
                        })
                        .on("error", (err) => {
                          reject(err);
                        })
                    )
                    .on("error", (err) => {
                      reject(err);
                    });
                } else {
                  reject();
                }
              })
              .catch((err) => reject(err));
          } else {
            reject();
          }
        })
        .catch((err) => reject(err));
    }
  });
}

function downloader(itemInfo) {
  if (itemInfo.needYoutubeDl) {
    return youtubeDlDownload(itemInfo);
  }
  return download(itemInfo.url);
}

module.exports = downloader;
