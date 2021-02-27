
/* eslint-disable node/no-unpublished-require */
import express, { NextFunction, Request, Response } from "express";
import youtubeDl from "youtube-dl";
import { downloader } from './downloader';
import { RedditItem } from './interface/Item';
import { ItemInfo } from './interface/itemInfo';
import { getAllInfo } from './item';
import { clientLogger, serverLogger } from "./logger";
import Zipper from "./zipper";



export { }; //todo needed for module with its own scope
require("body-parser");
require("express-zip");
const cors = require("cors");
const compression = require("compression");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/getHead/", (req, res) => {
   const { url } = req.body;
  youtubeDl.getInfo(url, (err: Error) => {
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

  const info = await getAllInfo({url:req.body.url, needYtdl: needYtdl, nameFile:path});
  res.setHeader("MediaSize", info.size);
  res.setHeader("MediaFormat", info.ext);

  downloader(info).then((response : NodeJS.ReadableStream) => {
      response
        .resume()
        .pipe(res)
        .on("error", (err: Error) => {
          next(err);
        })
        .on("close", () => {
          res.end();
        });
    })
    .catch((err: Error) => {
      next(err);
    });
});

app.post("/api/downBatchInfo/", (req, res, next) => {
  const archive = new Zipper();
  archive
    .getArchive()
    .resume()
    .on("finish", () => {
      res.end();
    })
    .on("error", (err: Error) => next(err))
    .pipe(res);
  const prepPromiseArray: Promise<void>[] = [];
  const prepArray: ItemInfo[] = [];
  const list:{needYtDl:string,folder?:string, name:string,url:string}[] = req.body
  list.forEach((el) => {
    const tmpFolder = el.folder ? `${el.folder}/` : ""; //todo name
    const item: RedditItem = {
      url: el.url,
      needYtdl: el.needYtDl ? (JSON.parse(el.needYtDl) ) : false,
      folder : tmpFolder,
      nameFile : tmpFolder + el.name.substr(0, 30)
    }

    prepPromiseArray.push(
      new Promise((prom, rej) => {
        getAllInfo(item)
          .then((elInfo: ItemInfo) => {
            prepArray.push(elInfo);
            prom();
          })
          .catch((err: Error) => {
            archive.addDownloadFail(el, "Couldn't get Info");
            rej(err);
          });
      })
    );
  });

  Promise.allSettled(prepPromiseArray).then(() => {
    const totalSize = prepArray.reduce((acc, val) => acc + val.size, 0);

    res.setHeader("MediaSize", totalSize);

    const promiseArray: Promise<void>[] = [];
    prepArray.forEach((element) => {
      promiseArray.push(
        new Promise((resolve, reject) =>
          downloader(element)
            .then((stream) => {
              return archive.addStream(stream, element.name, resolve, reject);
            })
            .catch((err: Error) => {
              archive.addDownloadFail(element, "Couldn't download the file");
              reject(err);
            })
        )
      );
    });

    Promise.allSettled(promiseArray).then(() => {
      archive.endArchive();
    });
  });
});

app.post("/api/logError/", (req) => {
  clientLogger.error(req.body);
});

app.use((err: string, req: Request, res: Response, next:NextFunction) => { //tocheck type //test
  if (req.xhr) {
    serverLogger.error(err);
    res.status(400).send(new Error(err));
  }
});
app.listen(3080);
