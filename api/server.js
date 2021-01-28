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
  console.log("DOWNLOAD ---------------------------------------");
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
  console.log("youtubeDlDownload");
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
    ).on("error", (err) => {
      console.log("ERROR " + err);
    });
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
        .saveToFile(name + "." + videoExt) // cant directly output stream for mp4 format
        .on("error", (err) => {
          clean();
          console.log("ffmpeg error");
        })
        .on("end", () => {
          clean();
          const stream = createReadStream(name + "." + videoExt)
            .on("error", (err) => {
              unlink(name + "." + videoExt, () => {});
              stream.destroy();
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

  function getInfoFormat(format, successCallback, errorCallback) {
    youtubeDl.getInfo(
      url,
      [
        "--hls-prefer-ffmpeg",
        "--restrict-filenames",
        "--output=media/%(title)s.%(ext)s",
        "--format=" + format,
      ],
      {},
      (err, info) => {
        if (err) {
          console.log("errorCallback  " + name);
          errorCallback(err);
        } else {
          // console.log(info);
          console.log("SuccessCallback  " + name);
          successCallback(info);
        }
      }
    );
  }
  const formatVideoOneStream =
    "best[ext=mp4][width<=1920]/best[width<=1920]/best[ext=mp4]/best";
  const formatVideoOnlyStream =
    "bestvideo[ext=mp4][width<=1920]/bestvideo[width<=1920]/bestvideo[ext=mp4]/bestvideo";
  const formatAudioOnlyStream = "bestaudio";

  getInfoFormat(
    formatVideoOneStream,
    (info) => {
      const stream = youtubeDlFormat(formatVideoOneStream);
      stream.pause();
      callback(stream);
    },
    (err) => {
      failCallback();

      getInfoFormat(
        formatVideoOnlyStream,
        (videoInfo) => {
          failCallback(new Error("Get Info Video Error"));

          getInfoFormat(
            formatAudioOnlyStream,
            (audioInfo) => {
              videoExt = videoInfo.ext;
              audioExt = audioInfo.ext;
              youtubeDlFormat(formatVideoOnlyStream)
                .pipe(
                  createWriteStream(name + "_video" + "." + videoExt)
                    .on("finish", () => {
                      videoStreamDone = true;
                      streamMerge(callback);
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
              youtubeDlFormat(formatAudioOnlyStream)
                .pipe(
                  createWriteStream(name + "_audio" + "." + audioExt)
                    .on("finish", () => {
                      audioStreamDone = true;
                      streamMerge(callback);
                    })
                    .on("error", (err) => {
                      console.log("failback : 2");
                      failCallback(err);
                    })
                )
                .on("error", (err) => {
                  console.log("failback : 1");
                  failCallback(err);
                });
            },
            (err) => {
              failback(new Error("Can't get audio data"));
            }
          );
        },
        (err) => {
          failCallback(new Error("Get Info Video Error"));
        }
      );
    }
  );
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
  const path = `media/${listPart.slice(-1)[0].substr(0, 30)}`;
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
          response.destroy();
        })
        .on("close", () => {
          res.end();
        });
      console.log("CALLBACK");
    },
    (err) => {
      console.log("ERROR");
      next(err);
    }
  );
});

app.post("/api/downBatchInfo/", (req, res, next) => {
  const promiseArray = [];
  const fileArray = [];
  const failArray = [];
  let toZipList = [];
  let zipping = false;

  const archive = new Packer({ store: true, level: 0 }); //todo option
  archive
    .on("error", (err) => {
      console.log("archive error");
      console.log(err);
    })
    .on("close", () => {
      console.log("archive CLose");
    })
    .on("finish", () => {
      console.log("archive finish");
      //   console.log(JSON.stringify(archive))
      res.end();
      archive.destroy();
    })
    .on("end", () => console.log("Archive End"))
    .on("unpipe", () => console.log("Archive unpipe"))
    .on("end", () => console.log("Archive End"));

  //todo unpipe
  res.on("error", () => console.log("resError"));

  function startZip() {
    console.log("startZip  " + toZipList.length);
    if (toZipList.length > 0) {
      let compressed = false;
      console.log(toZipList[0].stream + "  " + toZipList[0].name);
      console.log(toZipList[0].stream);
      const el = toZipList[0];
      console.log("startArchiving " + el.name.substr(0, 30));
      const name = el.name.substr(0, 30);
      const stream = el.stream
        .on("error", (err) => {
          console.log("Reject  Stream Error Zip " + name); //tocheck why not called
          el.reject();
          failArray.push(name); //tocheck
          stream.resume().destroy();
        })
        .on("close", () => {
          console.log("CLOSe Stream  " + name);
          if (compressed) {
            el.promise();
          } else {
            el.reject();
          }
          console.log(toZipList.length);
          toZipList.splice(0, 1);
          console.log(toZipList.length);
          //todo when received strream check if already closed
          //todo asynchroine
          //todo event not immediate
          startZip();
        });
      //todo add extensino to name
      archive.entry(
        stream,
        { name: el.name.substr(0, 30) },
        function (err, entry) {
          if (err) {
            compressed = false;
            // console.log(" RejectCompression Error  " + name + "  " + err);

            failArray.push(name);
            //  stream.on("close", () => el.reject());

            //startZip();
          } else {
            compressed = true;
            fileArray.push({
              //todo Move
              name: name,
            });
          }
        }
      );
    } else {
      console.log("STOP");
      zipping = false;
    }
  }
  archive.pipe(res).on("error", (err) => {
    console.log("failback : 1");
    next(err);
    archive.destroy();
  });
  //todo
  req.body.forEach((element) => {
    const folder = element.folder ? `${element.folder}/` : "";
    const nameFile = folder + element.name.substr(0, 30);
    const path = `media/${element.name}`;
    console.log(nameFile);

    const needYtdl = element.needYtDl ? JSON.parse(element.needYtDl) : false; //todo no undefined
    if (needYtdl) {
      promiseArray.push(
        new Promise((promise, reject) =>
          downloader(
            element.url,
            path,
            needYtdl,
            next,
            res,
            (stream) => {
              stream
                .on("error", (err) => {
                  failArray.push(nameFile);
                  reject();
                  console.log(
                    "Reject ERROR Callbaback " + nameFile + "   " + err
                  );

                  //   stream.resume().destroy(); //todo check destroy
                })
                .on("close", () => console.log("close " + nameFile))
                .on("end", () => console.log("end " + nameFile));
              if (zipping) {
                //todo try do it without recursion
                toZipList.push({
                  stream: stream,
                  name: nameFile,
                  promise: promise,
                  reject: reject,
                });
              } else {
                zipping = true;
                console.log("StartFromBase");
                toZipList.push({
                  stream: stream,
                  name: nameFile,
                  promise: promise,
                  reject: reject,
                });
                startZip();
              }
            },
            (err) => {
              failArray.push(nameFile);
              reject();
              console.log("Reject Failback" + nameFile + "   " + err);
            }
          )
        )
      );
    }
  });
  //tocheck important test same data / same order
  //tocheck pipe does not send error
  //tocheck stream must be posed before passed to functino (might not be same tick , => lost data )
  //tocheck stream will fail without even print console / error message if not pipe ( => msg only happen at specific point stream not all time )

  Promise.allSettled(promiseArray).then((resultPromises) => {
    setTimeout(() => {
      console.log("ALL Setled  " + promiseArray.length);

      resultPromises.forEach((el) => console.log(el.status));

      const stream = new Stream.Readable();
      stream
        .on("error", (err) => {
          console.log("Stream Error");
          stream.destroy();
          //next(err);
        })
        .on("close", () => console.log("stream success")); //todo on open
      stream.push(JSON.stringify({ success: fileArray, fail: failArray }));
      stream.push(null);

      archive.entry(stream, { name: "result.json" }, function (err, entry) {
        if (err) {
          console.log("compression error " + "result.json" + "   " + err);
        } else {
          console.log("Compression Success");
        }
        archive.finish();
      });
    }, 10000);

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
  if (req.xhr) {
    console.log("Error caught");
    // console.log(err);
    res.status(400).send(new Error("Download fail"));
  }
});
app.listen(3080);
