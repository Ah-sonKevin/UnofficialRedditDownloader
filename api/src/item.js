const format = require("./enum/mediaFormat");

async function getInfoFormat(url, format) {
  //tocheck async

  return new Promise((promise, reject) => {
    youtubeDl.getInfo(
      //tocheck block async
      url,
      [
        "--hls-prefer-ffmpeg",
        "--restrict-filenames",
        "--output=media/%(title)s.%(ext)s",
        "--format=" + format,
      ],
      {},
      (err, info) => {
        //tocheck nested
        if (err) {
          reject(err);
          errorCallback(err);
        } else {
          promise(info);
          successCallback(info);
        }
      }
    );
  });
}

async function getSize(url) {
  return await fetch(url, { method: "HEAD" })
    .then((res) => {
      const headers = res.headers;
      if (headers) {
        return headers.get("content-length") //todo update eslint ? to use ??
          ? parseInt(headers.get("content-length"))
          : 0;
      } else return 0;
    })
    .catch(() => null);
}

async function getAllInfo(url, needYoutubeDl, name, folder) { //toceck error in promise
  console.log(url + "  " + needYoutubeDl + "  " + name + "  " + folder);
  return new Promise((promise, reject) => {
    if (!needYoutubeDl) {
      getSize(url)
        .then((size) => {
          promise({
            isOneFile: false,
            url: url,
            size,
            name: name,
            folder: folder,
          });
        })
        .catch(() => {
          reject();
          console.log("REJECT SIZE !needYoutubeDl  " + name);
        });
    } else {
      return getInfoFormat(url, format.allInOne)
        .then(async (info) => {
          const size = await getSize(info.url);
          if (size) {
            promise({
              isOneFile: true,
              url: info.url,
              size,
              name: name,
              folder: folder,
            });
          } else {
            reject();
            console.log("REJECT SIZE  formatVideoOneStream" + name);
          }
        })
        .catch(() => {
          getInfoFormat(url, format.videoStream).then((infoVideo) => {
            getInfoFormat(url, format.audioStream)
              .then(async (infoAudio) => {
                let sizeVideo = await getSize(infoVideo.url);
                if (sizeVideo) {
                  let sizeAudio = await getSize(infoAudio.url);
                  if (sizeAudio) {
                    promise({
                      isOneFile: false,
                      videoUrl: infoVideo.url,
                      audioUrl: infoAudio.url,
                      size: sizeAudio + sizeVideo,
                      name: name,
                      folder: folder,
                    });
                  } else {
                    reject();
                    console.log("REJECT SIZE both  " + name);
                  }
                } else {
                  reject();
                }
              })
              .catch(() => {
                console.log(
                  "REJECT getInfoFormat  formatAudioOnlyStream " + name
                );
                reject();
              });
          });
        })
        .catch(() => {
          console.log("REJECT getInfoFormat formatVideoOnlyStream  " + name);
          reject();
        });
    }
  });
}

module.exports = { getAllInfo, getInfoFormat };
