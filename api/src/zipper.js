const Packer = require("zip-stream");
const Stream = require("stream");

class Zipper {
  archive;

  toZipList = [];

  failArray = [];

  fileArray = [];

  zipping = false;

  constructor() {
    // todo make into custom stream
    // tocheck need babel
    this.archive = new Packer({ store: true, zlib: { level: 0 } }).pause();
    this.archive.on("error", (err) => {
      console.log("archive error");
      console.log(err);
    });
  }

  addStream(stream, nameFile, promise, reject) {
    stream.on("error", (err) => {
      this.failArray.push(nameFile);
      reject();
      console.log(`Reject ERROR Callbaback ${nameFile}   ${err}`);
    });

    if (this.zipping) {
      this.toZipList.push({
        stream,
        name: nameFile,
        promise,
        reject,
      });
    } else {
      this.zipping = true;
      console.log("StartFromBase");
      this.toZipList.push({
        stream,
        name: nameFile,
        promise,
        reject,
      });

      this.startZip();
    }
  }

  endArchive() {
    const stream = new Stream.Readable();
    stream.on("error", () => {
      console.log("Stream Error");
      stream.destroy();
      // next(err);
    });
    stream.push(
      JSON.stringify({ success: this.fileArray, fail: this.failArray })
    );
    stream.push(null);

    this.archive.entry(stream, { name: "result.json" }, (err) => {
      if (err) {
        console.log(`${"compression error result.json   "}${err}`);
      } else {
        console.log("Compression Success");
      }
      this.archive.finish();
    });
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
          this.failArray.push(name); // tocheck
          stream.resume().destroy();
        })
        .on("close", () => {
          if (compressed) {
            el.promise(`Done ${name}`);
          } else {
            el.reject();
          }
          this.toZipList.splice(0, 1);
          this.startZip();
        });
      this.archive.entry(stream, { name: el.name.substr(0, 30) }, (err) => {
        if (err) {
          compressed = false;
          this.failArray.push(name);
        } else {
          compressed = true;
          this.fileArray.push({
            name,
          });
        }
      });
    } else {
      console.log("STOP");
      this.zipping = false;
    }
  }
}

module.exports = Zipper;
