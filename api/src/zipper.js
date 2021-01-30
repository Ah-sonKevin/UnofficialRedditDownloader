const Packer = require("zip-stream");
const Stream = require("stream");

class Zipper {
  archive;
  toZipList = [];
  failArray = [];
  fileArray = [];
  zipping = false;
  promiseArray = [];
  constructor() {
    //todo make into custom stream
    //tocheck need babel
    this.archive = new Packer({ store: true, level: 0 })
      .on("error", (err) => {
        console.log("archive error");
        console.log(err);
      })
      .on("finish", () => {
        console.log("archive finish");
        //   console.log(JSON.stringify(archive))
        res.end();
        archive.destroy();
      });
  }

  addStream(stream, nameFile, promise, reject) {
    stream.on("error", (err) => {
      this.failArray.push(nameFile);
      reject();
      console.log("Reject ERROR Callbaback " + nameFile + "   " + err);
    });

    if (this.zipping) {
      this.toZipList.push({
        stream: stream,
        name: nameFile,
        promise: promise,
        reject: reject,
      });
    } else {
      this.zipping = true;
      console.log("StartFromBase");
      this.toZipList.push({
        stream: stream,
        name: nameFile,
        promise: promise,
        reject: reject,
      });
      this.startZip();
    }
  }

  endArchive() {
    setTimeout(() => {
      console.log("ALL Setled  " + this.promiseArray.length);

      const stream = new Stream.Readable();
      stream.on("error", () => {
        console.log("Stream Error");
        stream.destroy();
        //next(err);
      });
      stream.push(
        JSON.stringify({ success: this.fileArray, fail: this.failArray })
      );
      stream.push(null);

      this.archive.entry(stream, { name: "result.json" }, function (err) {
        if (err) {
          console.log("compression error " + "result.json" + "   " + err);
        } else {
          console.log("Compression Success");
        }
        this.archive.finish();
      });
    }, 10000);
  }
  getArchive() {
    return this.archive;
  }

  startZip() {
    if (this.toZipList.length > 0) {
      let compressed = false;
      const el = this.toZipList[0];
      const name = el.name.substr(0, 30);
      const stream = el.stream
        .on("error", () => {
          el.reject();
          this.failArray.push(name); //tocheck
          stream.resume().destroy();
        })
        .on("close", () => {
          if (compressed) {
            el.promise();
          } else {
            el.reject();
          }
          this.toZipList.splice(0, 1);
          this.startZip();
        });
      this.archive.entry(
        stream,
        { name: el.name.substr(0, 30) },
        function (err) {
          if (err) {
            compressed = false;
            this.failArray.push(name);
          } else {
            compressed = true;
            this.fileArray.push({
              name: name,
            });
          }
        }
      );
    } else {
      console.log("STOP");
      this.zipping = false;
    }
  }
}

module.export = Zipper;
