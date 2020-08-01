import * as fs from 'fs';
import * as zlib from 'zlib';
import * as http from 'http';

const DATA_DIR = './data';
const MNIST_URL = 'http://yann.lecun.com/exdb/mnist/';
const trainImagesFile = 'train-images-idx3-ubyte';
const trainLabelsFile = 'train-labels-idx1-ubyte';
const testImagesFile = 't10k-images-idx3-ubyte';
const testLabelsFile = 't10k-labels-idx1-ubyte';

async function dowloadMnistDataset(fileName: string) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }
  const fullPathFile = `${DATA_DIR}/${fileName}`;
  if (!fs.existsSync(fullPathFile)) {
    const gzFile = `${fullPathFile}.gz`;
    if (!fs.existsSync(gzFile)) {
      const outputStream = fs.createWriteStream(gzFile);
      const response: any = await httpGetPromisified(
        `${MNIST_URL}${fileName}.gz`,
      );
      response.pipe(outputStream);
      await new Promise((resolve) =>
        outputStream.on('finish', () => {
          outputStream.on('close', () => resolve());
        }),
      );
    }
    await gunzipFilePaths(gzFile, fullPathFile);
  }
}

function downloadAll() {
  return Promise.all(
    [trainImagesFile, trainLabelsFile, testImagesFile, testLabelsFile].map(
      dowloadMnistDataset,
    ),
  );
}

function httpGetPromisified(url: string): Promise<any> {
  return new Promise((resolve, reject) => http.get(url, (res) => resolve(res)));
}

function gunzipFilePaths(
  compressedFilePath: string,
  uncompressedFilePath: string,
) {
  const compressed = fs.createReadStream(compressedFilePath);
  const uncompressed = fs.createWriteStream(uncompressedFilePath);

  return new Promise((resolve, reject) => {
    compressed
      .pipe(zlib.createGunzip())
      .pipe(uncompressed)
      .on('finish', (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

async function readFileData(fileName: string) {
  const stream = fs.createReadStream(`${DATA_DIR}/${fileName}`, {
    highWaterMark: 32 * 64,
  });

  const result = [];

  for await (const chunk of stream) {
    const start = 8;
    for (let i = start; i < chunk.length; i++) {
      result.push(chunk.readUInt8());
    }
  }

  return result;
}

async function getTrainImages() {
  return readFileData(trainImagesFile);
}

async function getTrainLabels() {
  return readFileData(trainLabelsFile);
}

async function getTestImages() {
  return readFileData(testImagesFile);
}

async function getTestLabels() {
  return readFileData(testLabelsFile);
}

function normalize(num: number) {
  return num !== 0 ? num / 255 : 0;
}

export {
  getTrainImages,
  getTrainLabels,
  getTestImages,
  getTestLabels,
  downloadAll,
  normalize
}

// downloadAll()