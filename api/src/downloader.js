const { createWriteStream, createReadStream, unlink } = require("fs");
const request = require("request");
require("express-zip");
const youtubeDl = require("youtube-dl");
const fetch = require("node-fetch");
const ffmpeg = require("fluent-ffmpeg");

const formatVideoOneStream =
  "best[ext=mp4][width<=1920]/best[width<=1920]/best[ext=mp4]/best";
const formatVideoOnlyStream =
  "bestvideo[ext=mp4][width<=1920]/bestvideo[width<=1920]/bestvideo[ext=mp4]/bestvideo";
const formatAudioOnlyStream = "bestaudio";

function youtubeDlFormat(url, format) {
  return youtubeDl(
    url,
    [
      "--hls-prefer-ffmpeg",
      "--restrict-filenames",
      "--output=media/%(title)s.%(ext)s",
      "--format=" + format,
    ],
    {}
  ).on("error", (err) => {
    console.log("ERROR " + err);
  });
}

function downloader(
  url,
  path,
  needYoutubeDl,
  next,
  res,
  callback,
  failCallback
) {
  if (needYoutubeDl) {
    youtubeDlDownload(url, path, next, res, callback, failCallback);
  } else {
    download(url, path, next, res, callback, failCallback);
  }
}

const download = function (uri, filepath, next, res, callback, failCallback) {
  console.log("DOWNLOAD ---------------------------------------");
  request(uri)
    .on("error", (err) => {
      failCallback(err);
    })
    .on("response", (response) => {
      response.pause();
      console.log("response  " + response.statusCode);
      if (response.statusCode === 200) {
        callback(response);
      } else {
        failCallback(new Error());
      }
    });
};

function youtubeDlDownload(itemInfo) {
  console.log("youtubeDlDownload");

  let videoStreamDone = false;
  let audioStreamDone = false;
  let audioExt = "";
  let videoExt = "";

  function streamMerge() {
    if (videoStreamDone && audioStreamDone) {
      let clean = () => {
        unlink(name + "_video" + "." + videoExt, () => {});
        unlink(name + "_audio" + "." + audioExt, () => {});
      };
      ffmpeg()
        .addInput(name + "_video" + "." + videoExt)
        .addInput(name + "_audio" + "." + audioExt)
        .audioCodec("copy")
        .videoCodec("copy")
        .saveToFile(name + "." + videoExt) // cant directly output stream for mp4 format
        .on("error", () => {
          clean();
          console.log("ffmpeg error");
        })
        .on("end", () => {
          clean();
          const stream = createReadStream(name + "." + videoExt)
            .on("error", () => {
              unlink(name + "." + videoExt, () => {});
              stream.destroy();
            })
            .on("close", () => {
              unlink(name + "." + videoExt, () => {});
            })
            .on("open", () => {
              callback(stream.pause());
            });
        });
    } else {
      return;
    }
  }

  console.log(url);
  getInfoFormat(
    url,
    formatVideoOneStream,
    () => {
      const stream = youtubeDlFormat(url, formatVideoOneStream); //todo replace ?
      stream.pause();
      callback(stream);
    },
    () => {
      getInfoFormat(
        url,
        formatVideoOnlyStream,
        (videoInfo) => {
          getInfoFormat(
            url,
            formatAudioOnlyStream,
            (audioInfo) => {
              videoExt = videoInfo.ext;
              audioExt = audioInfo.ext;

              youtubeDlFormat(url, formatVideoOnlyStream)
                .pipe(
                  createWriteStream(name + "_video" + "." + videoExt)
                    .on("finish", () => {
                      videoStreamDone = true;
                      streamMerge(callback);
                    })
                    .on("error", (err) => {
                      failCallback(err);
                    })
                )
                .on("error", (err) => {
                  failCallback(err);
                });

              /*  fetch(videoInfo.url, { method: "HEAD" }).then((resp) => { //todo
                  resp.body
                    .pipe(
                      createWriteStream(name + "_video" + "." + videoExt + "2")
                        .on("finish", () => {
                          console.log(
                            "DURATION FETCH :  " + (new Date().getTime() - time2)
                          );
                          videoStreamDone = true;
                          // streamMerge(callback);
                        })
                        .on("error", (err) => {
                          console.log("failback : 1");
                          failCallback(err);
                        })
                    )
                    .on("error", (err) => {
                      console.log("failback : 1");
                      failCallback(err);
                    });
                });*/
              youtubeDlFormat(url, formatAudioOnlyStream)
                .pipe(
                  createWriteStream(name + "_audio" + "." + audioExt)
                    .on("finish", () => {
                      audioStreamDone = true;
                      streamMerge(callback);
                    })
                    .on("error", (err) => {
                      failCallback(err);
                    })
                )
                .on("error", (err) => {
                  failCallback(err);
                });
            },
            () => {
              failCallback(new Error("Can't get audio data"));
            }
          );
        },
        () => {
          failCallback(new Error("Get Info Video Error"));
        }
      );
    }
  );
}

module.exports = { download };
