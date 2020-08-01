import * as fs from 'fs';
import {
  CrossValidate,
  NeuralNetwork
} from 'brain.js';

import {
  getTrainImages,
  getTrainLabels,
  getTestImages,
  getTestLabels,
  normalize,
  downloadAll,
} from './mnist';

const IMAGE_SIZE = 28 * 28;
const NET_OPTIONS = {
  hiddenLayers: [150]
}

const TRAIN_OPTIONS = {
  iterations: 2000,
  log: (details: any) => console.log(details)
}

async function run() {
  let labels: any[] = [];
  let digits: any[] = [];

  try {
    const trainLabels: any= await getTrainLabels();
    const trainDigits = await getTrainImages();
  
    const testLabels = await getTestLabels();
    const testDigits = await getTrainImages();

    labels = [...trainLabels, ...testLabels]
    digits = [...trainDigits, ...testDigits]
    
  } catch (error) {
    console.error(error)
  }

  const trainingData = [];

  for (let i = 0; i < labels.length; i++) {
    const start = i * IMAGE_SIZE;
    const input = digits.slice(start, start + IMAGE_SIZE).map(normalize)
    const output = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    output[labels[i]] = 1
    trainingData.push({ input, output })
  }

  const crossValidate = new CrossValidate(NeuralNetwork, NET_OPTIONS);
    crossValidate.train(trainingData, TRAIN_OPTIONS);
    const net = crossValidate.toNeuralNetwork();

    const model = net.toJSON();
    fs.writeFile('./data/model.json', JSON.stringify(model), 'utf8', () => console.log('model has been written'));

}

run()
