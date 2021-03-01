// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines-per-function */
import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import {
  downloadAllItems,
  getAllFilesInfo
} from "./downloader/batchDownloader";
import { downloader } from "./downloader/downloader";
import { isMultipleBody, isSIngleHeadBody, SoloItem } from "./interface/IInput";
import { ItemInfo } from "./interface/itemInfo";
import { getAllInfo, getDownloadInfo } from "./item";
import { clientLogger, serverLogger } from "./logger";
import Zipper from "./zipper";

export { }; // todo needed for module with its own scope
require("body-parser");
require("express-zip");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TEXT_SIZE = 30; // tocheck needed ? only one ?
// todo check input
app.post("/api/getHead/", (req, res, next) => {
	if (!isSIngleHeadBody(req.body)) {
		next(new Error("Invalid Input Body"));
		throw new Error(); // tocheck avoid
	}
	getDownloadInfo(req.body.url)
		.then(() => res.send(true))
		.catch(() => res.send(false));
});
// tocheck type guard before .json ?
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/api/downItem/", async (req, res, next) => {
	const item = req.body as SoloItem; // tocheck ?? type guard ?
	// todo send boolean instead of string (json)
	const listPart = item.url.split("/");
	const path = `${listPart.slice(-1)[0].substr(0, TEXT_SIZE)}`; // todo send name directly
	const needYtdl = item.needYdl ? (JSON.parse(item.needYdl) as boolean) : false;

	const info = await getAllInfo({
		url: item.url,
		needYtdl,
		name: path,
	});
	res.setHeader("MediaSize", info.size);
	res.setHeader("MediaFormat", info.ext);

	downloader(info)
		.then((response: NodeJS.ReadableStream) =>
			response
				.pipe(res)
				.on("error", (err: Error) => {
					next(err);
				})
				.on("close", () => {
					res.end();
				}),
		)
		.catch((err: Error) => {
			// eslint-disable-next-line promise/no-callback-in-promise
			next(err);
		});
});

// todo nested or own file or seprate function
// tocheck names properties
// todo add folder name to nameFIle /folderName/name

// eslint-disable-next-line max-statements
app.post("/api/downBatchInfo/", (req, res, next) => {
	const archive = new Zipper();
	archive
		.getArchive()
		.on("finish", () => {
			res.end();
		})
		.on("error", (err: Error) => next(err))
		.pipe(res);
	// tocheck structure
	if (!isMultipleBody(req.body)) {
		next(new Error("Invalid Input Body"));
		return;
	}
	const list = req.body;
	const prepArray: ItemInfo[] = [];
	const prepPromiseArray: Promise<ItemInfo>[] = getAllFilesInfo(
		// check promsie resolve value
		list,
		archive,
		prepArray,
	);

	Promise.allSettled(prepPromiseArray) // tocheck get array with all answer / replace prep array
		.then(() => {
			const totalSize = prepArray.reduce((acc, val) => acc + val.size, 0);
			res.setHeader("MediaSize", totalSize);

			const promiseArray: Promise<void>[] = downloadAllItems(
				prepArray,
				archive,
			);
			return Promise.allSettled(promiseArray);
		}) // tocheck
		.then(
			() => archive.endArchive(), // tocheck
		)
		.catch((err) => {
			// eslint-disable-next-line promise/no-callback-in-promise
			next(err);
		});
});

app.post("/api/logError/", (req) => {
	clientLogger.error(req.body);
});

app.use((err: string, req: Request, res: Response) => {
	// tocheck type //test
	if (req.xhr) {
		serverLogger.error(err);
		res.status(400).send(new Error(err));
	}
});
const PORT = 3080;
app.listen(PORT);
