/* eslint-disable node/no-unpublished-require */
const express = require("express");
require("body-parser");
const { unlink } = require("fs");
require("express-zip");
const youtubeDl = require("youtube-dl");
const fetch = require("node-fetch");
const cors = require("cors");
const compression = require("compression");
const Zipper = require("./src/zipper");
const downloader = require("./src/downloader");
const { getAllInfo } = require("./src/item");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//todo remove

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

app.post("/api/downItem/", async (req, res, next) => {
  const listPart = req.body.url.split(["/"]);
  const path = `media/${listPart.slice(-1)[0].substr(0, 30)}`;
  const needYtdl = req.body.needYdl ? JSON.parse(req.body.needYdl) : false;
  console.log("Before  getAllInfo2");

  let info = await getAllInfo(req.body.url, needYtdl, path);
  if (info) {
    //todo error handling
    res.setHeader("Content-Length", info.size);
  } else {
    console.log("SIZE Error  " + path);
  }

  downloader(
    req.body.url,
    path,
    needYtdl,
    next,
    res,
    (response) => {
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

      //console.log(response);

      console.log("CALLBACK");
    },
    (err) => {
      console.log("ERROR");
      next(err);
    }
  );
});

app.post("/api/downBatchInfo/", (req, res, next) => {
  //todo getAllInfo
  //todo interupt server udring downlaod error
  const archive = new Zipper();

  archive.getArchive().pipe(res); //tocheck handle error on all pipe
  const prepPromiseArray = [];
  const prepArray = [];
  req.body.forEach((el) => {
    const needYtdl = el.needYtDl ? JSON.parse(el.needYtDl) : false;
    prepPromiseArray.push(getAllInfo(el.url, needYtdl, el.name, el.folder));
  });
  //todo class
  Promise.allSettled(prepPromiseArray).then(() => {
    console.log("DOOONE");
    const totalSize = prepArray.reduce((acc, val) => (acc += val.size), 0);
    console.log(totalSize);
    res.setHeader("content-length", totalSize);

    const downloadFail = [];
    const promiseArray = [];
    prepArray.forEach((element) => {
      const folder = element.folder ? `${element.folder}/` : "";
      const nameFile = folder + element.name.substr(0, 30);
      const path = `media/${element.name}`;
      console.log(nameFile);

      const needYtdl = element.needYtDl ? JSON.parse(element.needYtDl) : false;
      promiseArray.push(
        new Promise((promise, reject) =>
          downloader(
            element.url,
            path,
            needYtdl,
            next,
            res,
            (stream) => {
              archive.addStream(stream, nameFile, promise, reject);
            },
            (err) => {
              downloadFail.push(nameFile);
              reject();
              console.log("Reject Failback" + nameFile + "   " + err);
            }
          )
        )
      );
    });
    Promise.allSettled(promiseArray).then(() => {
      archive.endArchive();
    });
  });
});
//TODO SELECT all page // all filtered
//todo cancel download
//tocheck pipeline send error and make sure to clean all stream
app.post("/api/downBatchList", function (req, res) {
  const list = req.body;

  res.zip(list, "archive");
  list.forEach((el) => unlink(el.name, () => {}));
});

app.use(function (err, req, res) {
  if (req.xhr) {
    console.log("Error caught");
    // console.log(err);
    res.status(400).send(new Error("Download fail"));
  }
});
app.listen(3080);
