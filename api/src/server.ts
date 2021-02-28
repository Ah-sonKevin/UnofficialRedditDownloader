// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-lines-per-function */
import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import { downloader } from "./downloader";
import { HeadInput, SoloItem } from "./interface/head";
import { RedditItem } from "./interface/Item";
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

function isSIngleHeadBody(item: unknown): item is HeadInput {
	return (item as { url: string }).url !== undefined;
}

app.post("/api/getHead/", (req, res, next) => {
	if (!isSIngleHeadBody(req.body)) {
		// todo check input
		next(new Error("Invalid Input Body"));
		return;
	}
	const url = req.body.url;
	getDownloadInfo(url)
		.then(() => res.send(true))
		.catch(() => res.send(false));
});
// tocheck type guard before .json ?

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/api/downItem/", async (req, res, next) => {
	const body = req.body as SoloItem; // tocheck ?? type guard ?
	const item: SoloItem = {
		url: body.url,
		needYdl: body.needYdl,
	};
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
				.resume()
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
function isMultipleBody(item: unknown): item is RedditItem[] {
	// batchItem or RedditItem
	const tmpArray = item as {
		needYtDl: string;
		folder?: string;
		name: string;
		url: string;
	}[];
	const tmp = tmpArray[0];
	return (
		tmp &&
		tmp.name !== undefined &&
		tmp.needYtDl !== undefined &&
		tmp.url !== undefined
	);
}

// eslint-disable-next-line max-statements
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
	// tocheck names properties
	if (!isMultipleBody(req.body)) {
		// tocheck structure
		next(new Error("Invalid Input Body"));
		return;
	}
	const list = req.body;

	list.forEach((item) => {
		// todo add folder name to nameFIle

		async function getAllInfoPrep(): Promise<void> {
			try {
				const elInfo = await getAllInfo(item);
				prepArray.push(elInfo);
				return void 0;
			} catch (e) {
				archive.addDownloadFail(item, "Couldn't get Info");
				if (e instanceof Error) {
					// tocheck what can e be
					throw e;
				} else {
					throw new Error(e);
				}
			}
		}
		// todo check element-plus grid (design)
		prepPromiseArray.push(getAllInfoPrep());
	});

	function downloadItem(element: ItemInfo): Promise<void> {
		return new Promise(
			(resolve, reject) =>
				// eslint-disable-next-line promise/no-nesting
				void downloader(element)
					.then((stream) =>
						archive.addStream({
							stream,
							nameFile: element.name,
							resolve,
							reject,
						}),
					)
					.catch((err: Error) => {
						archive.addDownloadFail(element, "Couldn't download the file");
						reject(err);
					}),
		);
	}

	Promise.allSettled(prepPromiseArray)
		.then(() => {
			const totalSize = prepArray.reduce((acc, val) => acc + val.size, 0);
			res.setHeader("MediaSize", totalSize);
			const promiseArray: Promise<void>[] = [];
			prepArray.forEach((element) => {
				promiseArray.push(downloadItem(element));
			});
			// eslint-disable-next-line promise/no-nesting
			return Promise.allSettled(promiseArray);
		}) // tocheck
		.then(
			() => archive.endArchive(), // tocheck
		)
		.catch((err) => {
			// eslint-disable-next-line promise/no-callback-in-promise
			serverLogger.error(err);
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
