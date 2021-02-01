const { createWriteStream, createReadStream, unlink } = require("fs");
require("express-zip");
const fetch = require("node-fetch").default; // tocheck
const ffmpeg = require("fluent-ffmpeg");

const basePath = "../media/";

function download(uri) {
  console.log(`url ${uri}`);
  return fetch(uri);
}

async function youtubeDlDownload(itemInfo) {
  return new Promise((promise, reject) => {
    console.log("youtubeDlDownload");

    let videoStreamDone = false;
    let audioStreamDone = false;
    let audioExt = "";
    let videoExt = "";

    function streamMerge() {
      if (videoStreamDone && audioStreamDone) {
        console.log(`streamMerge${videoStreamDone}${audioStreamDone}`);
        const clean = () => {
          unlink(`${basePath}${itemInfo.name}_video.${videoExt}`, () => {}); // todo add to info
          unlink(`${basePath}${itemInfo.name}_audio.${audioExt}`, () => {});
        };
        ffmpeg()
          .addInput(`${basePath}${itemInfo.name}_video.${videoExt}`)
          .addInput(`${basePath}${itemInfo.name}_audio.${audioExt}`)
          .audioCodec("copy")
          .videoCodec("copy")
          .saveToFile(`${basePath}${itemInfo.name}.${videoExt}`) // cant directly output stream for mp4 format
          .on("error", () => {
            clean();
            reject();
            console.log("ffmpeg error");
          })
          .on("end", () => {
            clean();
            const stream = createReadStream(
              `${basePath}${itemInfo.name}.${videoExt}`
            )
              .on("error", () => {
                unlink(`${basePath}${itemInfo.name}.${videoExt}`, () => {});
                reject();
                stream.destroy();
              })
              .on("close", () => {
                unlink(`${basePath}${itemInfo.name}.${videoExt}`, () => {});
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
        .catch((err) => reject(err)); // todo replace  fetch? | await catch
    } else {
      videoExt = itemInfo.video.ext;
      audioExt = itemInfo.audio.ext;

      console.log("two stream");

      // tocheck axios
      fetch(itemInfo.video.url)
        .then((respVideo) => {
          console.log(`respVideo ${respVideo.ok}`);
          if (respVideo.ok) {
            fetch(itemInfo.audio.url)
              .then((respAudio) => {
                if (respAudio) {
                  respVideo.body
                    .pipe(
                      createWriteStream(
                        `${basePath}${itemInfo.name}_video.${videoExt}`
                      )
                        .on("finish", () => {
                          videoStreamDone = true;
                          streamMerge();
                        })
                        .on("error", (err) => {
                          console.log("error");
                          console.log(err);
                          reject(err);
                        })
                    )
                    .on("error", (err) => {
                      console.log("error 2");
                      console.log(err);
                      reject(err);
                    });

                  respAudio.body
                    .pipe(
                      createWriteStream(
                        `${basePath}${itemInfo.name}_audio.${audioExt}`
                      )
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
                  console.log(`respAudio ${respAudio.ok}`);
                  console.log(
                    `path ${basePath}${itemInfo.name}_audio.${audioExt}`
                  );
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
