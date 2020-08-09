import React, { useRef, useEffect, useState } from 'react';
import './DisplayCanvas.css';

type DisplayCanvasProps = {
  prediction: Function;
};

const DEFAULT_DRAWING_BOX = {
  maxX: 0,
  maxY: 0,
  minX: Number.MAX_SAFE_INTEGER,
  minY: Number.MAX_SAFE_INTEGER,
};

export function DisplayCanvas({ prediction }: DisplayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const painting = useRef(false);
  const [drawingBox, setDrawingBox] = useState(DEFAULT_DRAWING_BOX);

  useEffect(() => {
    ctxRef.current = canvasRef.current
      ? canvasRef.current.getContext('2d')
      : null;
    if (canvasRef.current !== null) {
      canvasRef.current.height = 300;
      canvasRef.current.width = 300;
    }
  }, []);

  function startPosition(e: React.MouseEvent) {
    painting.current = true;
    draw(e);
  }

  function finishPosition() {
    painting.current = false;
    ctxRef.current !== null && ctxRef.current.beginPath();
  }

  // Resizing
  // function windowResize() {
  //   canvas.height = Math.floor(window.innerHeight / 2)
  //   canvas.width = Math.floor(window.innerWidth / 2)
  // }

  function draw({ nativeEvent }: React.MouseEvent) {
    if (
      !painting.current ||
      ctxRef.current === null ||
      canvasRef.current === null
    )
      return;
    const { offsetX, offsetY } = nativeEvent;

    ctxRef.current.lineWidth = 32;
    ctxRef.current.lineCap = 'round';
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);

    const { left, top } = canvasRef.current.getBoundingClientRect();

    const x = nativeEvent.clientX - left;
    const y = nativeEvent.clientY - top;

    setDrawingBox((box) => ({
      maxX: Math.max(box.maxX, x),
      maxY: Math.max(box.maxY, y),
      minX: Math.min(box.minX, x),
      minY: Math.min(box.minY, y),
    }));

    console.log(x, y, drawingBox)
  }

  function clearWindow() {
    if (ctxRef.current === null || canvasRef.current === null) return;
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    setDrawingBox(DEFAULT_DRAWING_BOX);
  }

  function sendDataUrl(send: Function | undefined) {
    if (!send || ctxRef.current === null || canvasRef.current === null) return;
    const canvasCopy = document.createElement('canvas');
    canvasCopy.width = 28;
    canvasCopy.height = 28;
    const copyContext = canvasCopy.getContext('2d');
    const ratioX = canvasRef.current.width / 28;
    const ratioY = canvasRef.current.height / 28;
    console.log('ratio', ratioX, ratioY)
    const drawBox = [
      drawingBox.minX,
      drawingBox.minY,
      drawingBox.maxX,
      drawingBox.maxY,
    ];
    console.log(drawBox)
    const scaledSourceWidth = Math.min(
      20,
      Math.max(4, (drawBox[2] - drawBox[0] + 32) / ratioX),
    );
    const scaledSourceHeight = Math.min(
      20,
      (drawBox[3] - drawBox[1] + 32) / ratioY,
    );
    const dx = (28 - scaledSourceWidth) / 2;
    const dy = (28 - scaledSourceHeight) / 2;

    copyContext &&
      copyContext.drawImage(
        canvasRef.current,
        drawBox[0] - 16,
        drawBox[1] - 16,
        drawBox[2] - drawBox[0] + 16,
        drawBox[3] - drawBox[1] + 16,
        dx,
        dy,
        scaledSourceWidth,
        scaledSourceHeight,
      );
    return copyContext ? send(copyContext.getImageData(0, 0, 28, 28)) : null;
  }

  return (
    <>
      <div className="display">
        <canvas
          className="display__canvas"
          onMouseDown={startPosition}
          onMouseUp={finishPosition}
          onMouseMove={draw}
          ref={canvasRef}
        />
      </div>
      <button onClick={clearWindow}>clear</button>
      <button onClick={() => sendDataUrl(prediction)}>prediction</button>
    </>
  );
}
