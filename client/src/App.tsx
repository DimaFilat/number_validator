import React, { useState } from 'react';

import { DisplayCanvas } from './components/DisplayCanvas';
import './App.css';

type Predict = {
  detectedNumberCNN: number
  detectionsCNN: number[]
}

function App() {
  const [predict, setPredict] = useState<Predict | null>(null)
  async function prepareDataFromCanvas({ data, width, height }: ImageData) {
    const imageDataCopy = { data, width, height };
    const response = await fetch('http://localhost:8080/model', {
      method: 'POST',
      credentials: 'include',
      referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageDataCopy),
    });
    const result = await response.json();
    setPredict(result)
  }

  return (
    <div className="App">
      <DisplayCanvas
        predict={predict}
        prediction={prepareDataFromCanvas}
        clearPredict={() => setPredict(null)}
      />
    </div>
  );
}

export default App;
