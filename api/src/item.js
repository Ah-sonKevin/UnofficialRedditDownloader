const fetch = require("node-fetch").default;
const bluebird = require("bluebird");
const youtubeDl = bluebird.promisifyAll(require("youtube-dl"));
const mediaFormat = require("./enum/mediaFormat");

function getInfoFormat(url, format) {
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
      const size = await getSize(info.url);
      if (size) {
        return {
          isOneFile: true,
          url: info.url,
          size,
          name: `${name.split(".")[0]}`,
          ext: info.ext,
          folder,
          needYoutubeDl,
        };
      }
      throw new Error();
    })
    .catch(async () => {
      const infoVideo = await getInfoFormat(url, mediaFormat.videoStream);
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
            name: `${name.split(".")[0]}`,
            ext: infoVideo.ext,
            folder,
            needYoutubeDl,
          };
        }
      }
      throw new Error();
    });
}

module.exports = getAllInfo;
