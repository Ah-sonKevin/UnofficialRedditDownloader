// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines-per-function */
import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import {
	downloadAllItems,
	getAllFilesInfo,
} from "./downloader/batchDownloader";
import { downloader } from "./downloader/downloader";
import { isMultipleBody, isSIngleHeadBody, SoloItem } from "./interface/IInput";
import { ItemInfo } from "./interface/itemInfo";
import { getAllInfo, getDownloadInfo } from "./item";
import { clientLogger, serverLogger } from "./logger";
import Zipper from "./zipper";

require("body-parser");
require("express-zip");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TEXT_SIZE = 30; // tocheck needed  or send name before
app.post("/api/getHead/", (req, res, next) => {
	if (!isSIngleHeadBody(req.body)) {
		next(new Error("Invalid Input Body"));
		// detail what happen after error / crash ?
	} else {
		getDownloadInfo(req.body.url)
			.then(() => res.send(true))
			.catch(() => res.send(false));
	}
});
// tocheck async express function
// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/api/downItem/", async (req, res, next) => {
	const item = req.body as SoloItem; // tocheck ?? type guard ?
	const listPart = item.url.split("/");
	const path = `${listPart.slice(-1)[0].substr(0, TEXT_SIZE)}`;
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
	if (!isMultipleBody(req.body)) {
		next(new Error("Invalid Input Body"));
		return;
	}
	const list = req.body;
	const prepArray: ItemInfo[] = [];
	const prepPromiseArray: Promise<ItemInfo>[] = getAllFilesInfo(
		list,
		archive,
		prepArray,
	);

	Promise.allSettled(prepPromiseArray)
		.then((x) => {
			const y = x[0];
			console.log(y); // tocheck value
			const totalSize = prepArray.reduce((acc, val) => acc + val.size, 0);
			res.setHeader("MediaSize", totalSize);

			const promiseArray: Promise<void>[] = downloadAllItems(
				prepArray,
				archive,
			);
			return Promise.allSettled(promiseArray);
		})
		.then(() => archive.endArchive())
		.catch((err) => {
			// eslint-disable-next-line promise/no-callback-in-promise
			next(err);
		});
});
// tocheck try/catch function to send in next function
app.post("/api/logError/", (req) => {
	clientLogger.error(req.body);
});

app.use((err: string, req: Request, res: Response) => {
	if (req.xhr) {
		serverLogger.error(err);
		res.status(400).send(new Error(err));
	}
});
const PORT = 3080;
app.listen(PORT);
