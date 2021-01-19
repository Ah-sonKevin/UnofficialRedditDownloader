const express = require("express");
require("body-parser");
const { createWriteStream, unlink } = require("fs");
const request = require("request");
require("express-zip");
const youtubeDl = require("youtube-dl");
require("node-fetch");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const compression = require("compression");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //why extended

const download = function (uri, filepath, next, callback, failCallback) {
  request(uri)
    .on("error", (err) => next(err))
    .on("response", (response) => {
      if (response.statusCode === 200) {
        response
          .pipe(createWriteStream(filepath))
          .on("error", (err) => next(err))
          .on("close", () => {
            callback();
          });
      } else {
        failCallback();
      }
    });
};

function youtubeDlDownload(url, name, next, callback, failCallback) {
  function youtubeDlFormat(format) {
    return youtubeDl(
      url,
      [
        "--hls-prefer-ffmpeg",
        "--restrict-filenames",
        "--output=media/%(title)s.%(ext)s",
        "--format=" + format,
      ],
      {}
    );
  }
  let videoStreamDone = false;
  let audioStreamDone = false;
  let audioExt = "";
  let videoExt = "";
  function streamMerge() {
    if (videoStreamDone && audioStreamDone) {
      ffmpeg()
        .addInput(name + "_video" + "." + videoExt)
        .addInput(name + "_audio" + "." + audioExt)
        .saveToFile(name + "." + videoExt)
        .on("end", function () {
          callback();
          unlink(name + "_video" + "." + videoExt, () => {});
          unlink(name + "_audio" + "." + videoExt, () => {});
        });
    } else {
      return;
    }
  }

  function getInfoFormat(format, callback) {
    return youtubeDl.getInfo(
      url,
      [
        "--hls-prefer-ffmpeg",
        "--restrict-filenames",
        "--output=media/%(title)s.%(ext)s",
        "--format=" + format,
      ],
      {},
      callback
    );
  }
  const formatVideoOneStream =
    "best[ext=mp4][width<=1920]/best[width<=1920]/best[ext=mp4]/best";
  const formatVideoOnlyStream =
    "bestvideo[ext=mp4][width<=1920]/bestvideo[width<=1920]/bestvideo[ext=mp4]/bestvideo";
  const formatAudioOnlyStream = "bestaudio";
  getInfoFormat(formatVideoOneStream, function (err, info) {
    if (!err) {
      youtubeDlFormat(formatVideoOneStream).pipe(
        createWriteStream(name + "." + info.ext).on("close", () => {
          callback();
        })
      );
    } else {
      getInfoFormat(formatVideoOnlyStream, function (videoErr, videoInfo) {
        getInfoFormat(formatAudioOnlyStream, function (audioErr, audioInfo) {
          if (videoErr || audioErr) {
            failCallback();
          } else {
            videoExt = videoInfo.ext;
            audioExt = audioInfo.ext;
            youtubeDlFormat(formatVideoOnlyStream).pipe(
              createWriteStream(name + "_video" + "." + videoExt)
                .on("finish", () => {
                  videoStreamDone = true;
                  streamMerge(callback);
                })
                .on("error", () => {
                  failCallback();
                })
            );
            youtubeDlFormat(formatAudioOnlyStream).pipe(
              createWriteStream(name + "_audio" + "." + audioExt)
                .on("finish", () => {
                  audioStreamDone = true;
                  streamMerge(callback);
                })
                .on("error", () => {
                  failCallback();
                })
            );
          }
        });
      });
    }
  });
}

function downloader(url, path, needYoutubeDl, next, callback, failCallback) {
  if (needYoutubeDl) {
    youtubeDlDownload(url, path, next, callback, failCallback);
  } else {
    download(url, path, next, callback, failCallback);
  }
}

app.post("/api/getHead/", (req, res) => {
  const url = req.body.url;
  youtubeDl.getInfo(url, function (err) {
    if (err) {
      res.send(false);
      return;
    } else {
      res.send(true);
    }
  });
});

app.post("/api/downItem/", (req, res, next) => {
  const listPart = req.body.url.split(["/"]);
  const path = `media/${listPart.slice(-1)[0]}`;
  const needYtdl = req.body.needYdl ? JSON.parse(req.body.needYdl) : false;

  downloader(
    req.body.url,
    path,
    needYtdl,
    next,
    () => {
      res.download(path, req.body.name, () => {
        unlink(path, () => {});
      });
    },
    () => {
      res.status(400).send(new Error("Download fail"));
    }
  );
});

app.post("/api/downBatchInfo/", (req, res, next) => {
  const promiseArray = [];
  const fileArray = [];
  const failArray = [];
  req.body.forEach((element) => {
    const folder = element.folder ? `${element.folder}/` : "";
    const nameFile = folder + element.name;
    const path = `media/${element.name}`;
    const needYtdl = element.needYdl ? JSON.parse(element.needYdl) : false;

    promiseArray.push(
      new Promise((promise, reject) =>
        downloader(
          element.url,
          path,
          needYtdl,
          next,

          () => {
            fileArray.push({
              path,
              name: nameFile,
            });
            promise();
          },
          () => {
            failArray.push(nameFile);
            reject();
          }
        )
      )
    );
  });
  Promise.allSettled(promiseArray).then(() => {
    res.send(JSON.stringify({ success: fileArray, fail: failArray }));
    //res.zip(fileArray, "archive");
    //fileArray.forEach((el) => unlink(el.name, () => {}));
  });
});

app.post("/api/downBatchList", function (req, res) {
  const list = req.body;

  res.zip(list, "archive");
  list.forEach((el) => unlink(el.name, () => {}));
});

app.use(function (err) {
  console.log("Error caught");
  console.log(err);
  throw err;
});
app.listen(3080);
