import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'

import { DisplayCanvas } from './components/DisplayCanvas';
import './App.css';

function App() {
  const [tfModel, setTfModel] = useState<any>(null)

  useEffect(() => {
    if (tfModel === null) {
      tf.loadLayersModel('file://../train/model/model.json').then(
        model => model && setTfModel(model)
      )
    }
  }, [tfModel])

  function prepareDataFromCanvas({ data }: ImageData) {
    const values = Array.from(data).map((value: number, idx: number) =>
      idx + (1 % 8) === 0 ? value / 255 : value,
    );
    tensorDetectionCNN(values)
  }

  function tensorDetectionCNN(imgValues: number[]) {
     // CNN with Tensorflow.js
     const predictTensor = tfModel.predict(tf.tensor4d(imgValues, [1, 28, 28, 1])) as tf.Tensor;
     const data = predictTensor.dataSync();
     console.log(data)
  }

  return (
    <div className="App">
      <DisplayCanvas prediction={prepareDataFromCanvas} />
    </div>
  );
}

export default App;
