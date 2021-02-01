/* eslint-disable no-undef */
const bluebird = require("bluebird");
// const youtubeDl = require("youtube-dl");
const f = bluebird.promisifyAll(require("youtube-dl"));

// @ts-ignore
console.log(f.getInfoAsync);
