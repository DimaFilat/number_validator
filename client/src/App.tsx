import React from 'react';

import { DisplayCanvas } from './components/DisplayCanvas';
import './App.css';

function App() {
  async function prepareDataFromCanvas({ data, width, height }: ImageData) {
    const imageDataCopy = { data, width, height };
    console.log(imageDataCopy);
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
    console.log('client result', result);
  }

  return (
    <div className="App">
      <DisplayCanvas prediction={prepareDataFromCanvas} />
    </div>
  );
}

export default App;
