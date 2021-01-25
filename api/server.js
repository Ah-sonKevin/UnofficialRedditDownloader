/* eslint-disable node/no-unpublished-require */
const express = require("express");
require("body-parser");
const { createWriteStream, createReadStream, unlink } = require("fs");
const request = require("request");
require("express-zip");
const youtubeDl = require("youtube-dl");
require("node-fetch");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const compression = require("compression"); //todo migrate from request
const Packer = require("zip-stream");
const Stream = require("stream");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const download = function (uri, filepath, next, res, callback, failCallback) {
  console.log("download");
  request(uri)
    .on("error", (err) => {
      console.log("failback : download");
      failCallback(err);
    })
    .on("response", (response) => {
      response.pause();
      console.log("response  " + response.statusCode);
      if (response.statusCode === 200) {
        callback(response);
      } else {
        console.log("failback : download 2 ");
        failCallback(new Error());
      }
    });
};

function youtubeDlDownload(url, name, next, res, callback, failCallback) {
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
      let clean = () => {
        unlink(name + "_video" + "." + videoExt, () => {});
        unlink(name + "_audio" + "." + audioExt, () => {});
      };
      ffmpeg()
        .addInput(name + "_video" + "." + videoExt)
        .addInput(name + "_audio" + "." + audioExt)
        .audioCodec("copy")
        .videoCodec("copy")
        .on("error", (err) => {
          clean();
          next(err);
        })
        .saveToFile(name + "." + videoExt) // cant directly output stream for mp4 format
        .on("end", () => {
          clean();
          const stream = createReadStream(name + "." + videoExt)
            .on("error", (err) => {
              unlink(name + "." + videoExt, () => {});
              next(err);
            })
            .on("close", () => {
              unlink(name + "." + videoExt, () => {});
              console.log("Close create stream");
            })
            .on("open", () => {
              callback(stream.pause());
            });
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
      const stream = youtubeDlFormat(formatVideoOneStream);
      stream.pause();
      callback(stream);
      //);
    } else {
      getInfoFormat(formatVideoOnlyStream, function (videoErr, videoInfo) {
        getInfoFormat(formatAudioOnlyStream, function (audioErr, audioInfo) {
          if (videoErr || audioErr) {
            console.log("failback : videoErr|AUdioErr");
            failCallback(new Error("Get Info Error"));
          } else {
            videoExt = videoInfo.ext;
            audioExt = audioInfo.ext;
            youtubeDlFormat(formatVideoOnlyStream).pipe(
              createWriteStream(name + "_video" + "." + videoExt)
                .on("finish", () => {
                  videoStreamDone = true;
                  streamMerge(callback);
                })
                .on("error", (err) => {
                  console.log("failback : 1");
                  failCallback(err);
                })
            );
            youtubeDlFormat(formatAudioOnlyStream).pipe(
              createWriteStream(name + "_audio" + "." + audioExt)
                .on("finish", () => {
                  audioStreamDone = true;
                  streamMerge(callback);
                })
                .on("error", (err) => {
                  console.log("failback : 2");
                  failCallback(err);
                })
            );
          }
        });
      });
    }
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
  console.log(needYoutubeDl);
  if (needYoutubeDl) {
    youtubeDlDownload(url, path, next, res, callback, failCallback);
  } else {
    download(url, path, next, res, callback, failCallback);
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
  console.log(req.body.url + " " + path);
  downloader(
    req.body.url,
    path,
    needYtdl,
    next,
    res,
    (response) => {
      //todo res.setHeader("Content-Length", response.headers["content-length"]);
      response
        .resume()
        .pipe(res)
        .on("error", (err) => {
          next(err);
        })
        .on("close", () => {
          res.end();
        });
    },
    (err) => {
      next(err);
      res.status(400).send(new Error("Download fail"));
    }
  );
});

app.post("/api/downBatchInfo/", (req, res, next) => {
  const promiseArray = [];
  const fileArray = [];
  const failArray = [];
  let toZipList = [];
  let zipping = false;

  const archive = new Packer(); //todo option
  archive.on("error", (err) => {
    console.log("archive error");
    console.log(err);
    next(err);
  });
  archive.on("close", () => {
    console.log("archive CLose");
  });
  archive.on("finish", () => {
    console.log("archive finish");
    //   console.log(JSON.stringify(archive))
    res.end();
  });

  res.on("error", () => console.log("resError"));

  function startZip(promise) {
    console.log("**********************************");
    let nameList = "";
    toZipList.forEach((el) => (nameList += el.name.substr(0, 30)));
    console.log(nameList);
    console.log(toZipList.length);
    if (toZipList.length > 0) {
      console.log("startArchiving " + toZipList[0].name.substr(0, 30));
      const name = toZipList[0].name.substr(0, 30);
      const stream = toZipList[0].stream
        .on("error", (err) => {
          console.log("Stream Error");
          next(err);
        })
        .on("close", () => {
          console.log("CLOSe Stream");
        });

      archive.entry(
        stream,
        { name: toZipList[0].name.substr(0, 30) },
        function (err, entry) {
          if (err) {
            console.log("Compression Error");
            next(err);
          } else {
            console.log("Compression End");
            console.log(toZipList.length);
            toZipList.splice(0, 1);
            console.log(toZipList.length);
            startZip(promise);
            //promise();
            //res.end();
          }
        }
      );
    } else {
      console.log("STOP");
      zipping = false;
      promise();
    }
  }
  archive.pipe(res);
  //todo
  req.body.forEach((element) => {
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    const folder = element.folder ? `${element.folder}/` : "";
    const nameFile = folder + element.name;
    const path = `media/${element.name}`;
    console.log(element.url + " " + path);

    const needYtdl = element.needYtDl ? JSON.parse(element.needYtDl) : false; //todo no undefined
    promiseArray.push(
      new Promise((promise, reject) =>
        downloader(
          element.url,
          path,
          needYtdl,
          next,
          res,
          (stream) => {
            fileArray.push({
              path,
              name: nameFile,
            });
            console.log("PromiseArray Size : " + promiseArray.length);
            if (zipping) {
              console.log("zipping :" + zipping);
              toZipList.push({ stream: stream, name: nameFile });
              promise();
            } else {
              console.log("zipping :" + zipping);
              zipping = true;
              console.log("StartFromBase");
              toZipList.push({ stream: stream, name: nameFile });
              startZip(promise);
            }

            console.log("EndLoop");
          },
          (err) => {
            console.log("failback");
            failArray.push(nameFile);
            reject();
            next(err);
          }
        )
      )
    );
  });
  //tocheck important test same data / same order
  //tocheck pipe does not send error
  //tocheck stream must be posed before passed to functino (might not be same tick , => lost data )
  //tocheck stream will fail without even print console / error message if not pipe ( => msg only happen at specific point stream not all time )

  Promise.allSettled(promiseArray).then((resultPromises) => {
    resultPromises.forEach((el) => console.log(el.status));
    console.log("ALL Setled  " + promiseArray.length);
    const stream = new Stream.Readable();
    stream
      .on("error", (err) => {
        console.log("Stream Error");
        next(err);
      })
      .on("close", () => console.log("stream success"));
    stream.push(JSON.stringify({ success: fileArray, fail: failArray }));
    stream.push(null);

    archive.entry(stream, { name: "result.json" }, function (err, entry) {
      if (err) {
        console.log("compression error");
        next(err);
      } else {
        console.log("Compression Success");
        archive.finish();
      }
    });
    //todo make lisot at compression time
    //todo test different type video / extention / type/ need ytdl
  });
});
//TODO SELECT all page // all filtered
//todo confirm /undo last batch delete
//todo cancel download
//todo popup xxx donwload done
//tocheck pipeline send error and make sure to clean all stream
app.post("/api/downBatchList", function (req, res) {
  const list = req.body;

  res.zip(list, "archive");
  list.forEach((el) => unlink(el.name, () => {}));
});

app.use(function (err, req, res, next) {
  console.log("Error caught");
  console.log(err);
  res.end();
  throw err;
});
app.listen(3080);
