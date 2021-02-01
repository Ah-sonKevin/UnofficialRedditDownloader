/* eslint-disable node/no-unpublished-require */
const express = require("express");
require("body-parser");
require("express-zip");
const youtubeDl = require("youtube-dl");
const cors = require("cors");
const compression = require("compression");
const { createWriteStream, createReadStream, unlink } = require("fs");
const Zipper = require("./zipper");
const downloader = require("./downloader");
const getAllInfo = require("./item");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// todo remove

app.post("/api/getHead/", (req, res) => {
  const { url } = req.body;
  youtubeDl.getInfo(url, (err) => {
    if (err) {
      res.send(false);
    } else {
      res.send(true);
    }
  });
});

app.post("/api/downItem/", async (req, res, next) => {
  const listPart = req.body.url.split(["/"]);
  const path = `${listPart.slice(-1)[0].substr(0, 30)}`;
  const needYtdl = req.body.needYdl ? JSON.parse(req.body.needYdl) : false;

  const info = await getAllInfo(req.body.url, needYtdl, path, null);
  if (info) {
    // todo error handling
    res.setHeader("Content-Length", info.size);
  } else {
    console.log(`SIZE Error  ${path}`);
  }
  console.log(info);

  downloader(info)
    .then((response) => {
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
      console.log("promise");
    })
    .catch((err) => {
      console.log("ERROR");
      next(err);
    });
});

app.post("/api/downBatchInfo/", (req, res, next) => {
  // todo getAllInfo
  // todo interupt server udring downlaod error

  const archive = new Zipper();
  archive
    .getArchive()
    .resume()
    .on("finish", () => {
      console.log("archive finish");
      //   console.log(JSON.stringify(archive))
      res.end();
    })
    .on("error", (err) => next(err))
    .pipe(
      res
        .on("error", (err) => next(err))
        .on("close", () => console.log("Close res"))
    ); // tocheck handle error on all pipe
  const prepPromiseArray = [];
  const prepArray = [];

  req.body.forEach((el) => {
    const needYtdl = el.needYtDl ? JSON.parse(el.needYtDl) : false;
    const folder = el.folder ? `${el.folder}/` : "";
    const nameFile = folder + el.name.substr(0, 30);

    prepPromiseArray.push(
      new Promise((prom, rej) => {
        getAllInfo(el.url, needYtdl, nameFile, folder)
          .then((elInfo) => {
            prepArray.push(elInfo);
            prom();
          })
          .catch((err) => rej(err));
      })
    );
  });

  // todo class

  Promise.allSettled(prepPromiseArray).then(() => {
    console.log("DOOONE");
    console.log(prepArray.length);
    const totalSize = prepArray.reduce((acc, val) => acc + val.size, 0);
    console.log(`${totalSize}  ${typeof totalSize}`);

    res.setHeader("MediaSize", totalSize); // try without reseult . json //§remeber that

    const downloadFail = [];
    const promiseArray = [];
    prepArray.forEach((element) => {
      promiseArray.push(
        new Promise((promise, reject) =>
          downloader(element)
            .then((stream) => {
              archive.addStream(stream, element.name, promise, reject);
            })
            .catch((err) => {
              downloadFail.push(element.name);
              reject();
              console.log(`Reject Failback${element.name}   ${err}`);
            })
        )
      );
    });

    Promise.allSettled(promiseArray).then((resArray) => {
      console.log(resArray.length);
      archive.endArchive();
    });
  });
});
// TODO SELECT all page // all filtered
// todo cancel download
// tocheck pipeline send error and make sure to clean all stream

app.use((err, req, res) => {
  if (req.xhr) {
    console.log("Error caught");
    // console.log(err);
    res.status(400).send(new Error("Download fail"));
  } else {
    console.log("Other Error");
  }
});
app.listen(3080);
