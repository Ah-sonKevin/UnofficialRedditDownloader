import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import { downloader } from "./downloader";
import { RedditItem } from "./interface/Item";
import { ItemInfo } from "./interface/itemInfo";
import { getAllInfo, getDownloadInfo } from "./item";
import { clientLogger, serverLogger } from "./logger";
import Zipper from "./zipper";

export {}; // todo needed for module with its own scope
require("body-parser");
require("express-zip");

const app = express();
app.use(compression());
app.use(express.static("media"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TEXT_SIZE = 30; // tocheck needed ? only one ?

function isSIngleBody(item: any): item is { url: string } {
	return (item as { url: string }).url !== undefined;
}

app.post("/api/getHead/", (req, res, next) => {
	if (!isSIngleBody(req.body)) {
		// todo check input
		next(new Error("Invalid Input Body"));
		return;
	}
	const { url } = req.body;
	// todo
	getDownloadInfo(url)
		.then(() => res.send(true))
		.catch(() => res.send(false));
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.post("/api/downItem/", async (req, res, next) => {
	const body = req.body as { url: string; needYdl: string }; // tocheck
	const item: { url: string; needYdl: string } = {
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
		nameFile: path,
	});
	res.setHeader("MediaSize", info.size);
	res.setHeader("MediaFormat", info.ext);

	downloader(info)
		.then((response: NodeJS.ReadableStream) =>
			response
				.resume()
				.pipe(res)
				.on("error", (err: Error) => {
					throw err;
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

function isMultipleBody(
	item: any,
): item is { needYtDl: string; folder?: string; name: string; url: string }[] {
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
	const list: {
		needYtDl: string;
		folder?: string;
		name: string;
		url: string;
	}[] = req.body;

	list.forEach((el) => {
		const tmpFolder = el.folder ? `${el.folder}/` : ""; // todo name
		const item: RedditItem = {
			url: el.url,
			needYtdl: el.needYtDl ? (JSON.parse(el.needYtDl) as boolean) : false,
			folder: tmpFolder,
			nameFile: tmpFolder + el.name.substr(0, TEXT_SIZE),
		};

		prepPromiseArray.push(
			new Promise((resolve, reject) => {
				getAllInfo(item)
					.then((elInfo: ItemInfo) => {
						prepArray.push(elInfo);
						return resolve(); // tocheck
					})
					.catch((err: Error) => {
						archive.addDownloadFail(el, "Couldn't get Info");
						reject(err);
					});
			}),
		);
	});

	Promise.allSettled(prepPromiseArray) // todo redo
		.then(() => {
			const totalSize = prepArray.reduce((acc, val) => acc + val.size, 0);

			res.setHeader("MediaSize", totalSize);

			const promiseArray: Promise<void>[] = [];
			prepArray.forEach((element) => {
				promiseArray.push(
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					new Promise((resolve, reject) =>
						// eslint-disable-next-line promise/no-nesting
						downloader(element)
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
					),
				);
			});

			// eslint-disable-next-line promise/no-nesting
			return Promise.allSettled(promiseArray) // tocheck
				.then(
					() => archive.endArchive(), // tocheck
				)
				.catch((err) => {
					serverLogger.error(err);
					throw err;
				});
		})
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
