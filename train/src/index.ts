import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import * as tf from '@tensorflow/tfjs-node';

const IP = 'localhost';
const PORT = 8080;
const BACKLOG = 100;

async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', ' http://localhost:3000');
  res.setHeader('Vary', 'Origin');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, acess-control-allow-origin',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  console.log(req.url, req.method);
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }
  switch (req.url) {
    case '/model':
      res.setHeader('Content-Type', 'application/json');
      if (req.method === 'POST') {
        console.log('hello');
        const imageData = await getJSONDataFromRequestStream<ImageData>(req);
        const model = await tf.loadLayersModel('file://./model/model.json');
        const values = prepareImageData(imageData);
        const predictTensor = model.predict(
          tf.tensor4d(values, [1, 28, 28, 1]),
        ) as tf.Tensor;
        const data = predictTensor.dataSync<'float32'>();
        const detectedNumberCNN = indexMax(data);
        const detectionsCNN = data;
        console.log(detectedNumberCNN, detectionsCNN);
        console.log(tf.argMax(predictTensor, 1).dataSync());
        res.statusCode = 200;
        return res.end(JSON.stringify({ detectedNumberCNN, detectionsCNN }));
      }
      res.statusCode = 404;
      res.end();
      return;
    default:
      res.statusCode = 404;
      res.end();
      return;
  }
}

const server: Server = createServer(requestHandler);

server
  .listen(PORT, IP, BACKLOG, () => {
    console.log(`Server listen on port: ${PORT}`);
  })
  .on('error', (error: Error) => {
    console.log(`Something went wrong ${error}`);
  });

function getJSONDataFromRequestStream<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve) => {
    const chunks: any[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(JSON.parse(Buffer.concat(chunks).toString()));
    });
  });
}

function prepareImageData(imageData: ImageData) {
  const numPixels = imageData.width * imageData.height;
  const values = new Array<number>(numPixels);
  for (let i = 0; i < numPixels; i++) {
    values[i] = imageData.data[i * 4 + 3] / 255.0;
  }
  return values;
}

function indexMax(data: Float32Array): number {
  let indexMax = 0;
  for (let r = 0; r < data.length; r++) {
    indexMax = data[r] > data[indexMax] ? r : indexMax;
  }

  return indexMax;
}
