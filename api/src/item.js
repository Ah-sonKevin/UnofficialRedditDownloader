// const fetch = require("node-fetch");
const fetch = require("node-fetch").default;
const bluebird = require("bluebird");
const youtubeDl = bluebird.promisifyAll(require("youtube-dl"));
const mediaFormat = require("./enum/mediaFormat");

function getInfoFormat(url, format) {
  bluebird.promisifyAll(youtubeDl);
  // tocheck async
  // tocheck promisifty /  nested async
  // @ts-ignore
  return youtubeDl.getInfoAsync(
    url,
    [
      "--hls-prefer-ffmpeg",
      "--restrict-filenames",
      "--output=media/%(title)s.%(ext)s",
      `--format=${format}`,
    ],
    {}
  );
}

function getSize(url) {
  return fetch(url, { method: "HEAD" }).then((res) => {
    const { headers } = res;
    const size = headers.get("content-length");
    if (headers) {
      return size ? parseInt(headers.get("content-length")) : 0;
    }
    return 0;
  });
}

/**
 * @param {string} url
 * @param {boolean} needYoutubeDl
 * @param {string} name
 * @param {string} folder
 */
async function getAllInfo(url, needYoutubeDl, name, folder) {
  // tocheck error in promise
  console.log(`${url}  ${needYoutubeDl}  ${name}  ${folder}`);
  if (!needYoutubeDl) {
    const size = await getSize(url);
    if (size) {
      return {
        isOneFile: true,
        url,
        size,
        name,
        folder,
        needYoutubeDl,
      };
    }
    throw new Error();
  }
  return getInfoFormat(url, mediaFormat.allInOne)
    .then(async (info) => {
      console.log("allInOne");
      console.log(info);
      const size = await getSize(info.url);
      if (size) {
        return {
          isOneFile: true,
          url: info.url,
          size,
          name,
          folder,
          needYoutubeDl,
        };
      }
      throw new Error();
    })
    .catch(async () => {
      console.log("videoStream");
      const infoVideo = await getInfoFormat(url, mediaFormat.videoStream); // tocheck await and catch
      const infoAudio = await getInfoFormat(url, mediaFormat.audioStream);
      const sizeVideo = await getSize(infoVideo.url);
      if (sizeVideo) {
        const sizeAudio = await getSize(infoAudio.url);
        if (sizeAudio) {
          return {
            isOneFile: false,
            video: { url: infoVideo.url, ext: infoVideo.ext },
            audio: { url: infoAudio.url, ext: infoAudio.ext },
            size: sizeAudio + sizeVideo,
            name,
            folder,
            needYoutubeDl,
          };
        }
      }
      throw new Error();
    });
}

module.exports = getAllInfo;
