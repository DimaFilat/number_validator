import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import * as tf from '@tensorflow/tfjs-node';

const IP = 'localhost';
const PORT = 8080;
const BACKLOG = 100;

async function requestHandler(req: IncomingMessage, res: ServerResponse) {
  console.log(req.url);
  switch (req.url) {
    case '/model':
      const model = await tf.loadLayersModel('file://./model/model.json');
      res.end(JSON.stringify(model));
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
