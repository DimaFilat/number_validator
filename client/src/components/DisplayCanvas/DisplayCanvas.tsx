import React, { useRef, useEffect } from 'react';
import './DisplayCanvas.css';

type DisplayCanvasProps = {
  prediction?: Function
}

export function DisplayCanvas({ prediction }: DisplayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const painting = useRef(false);

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
    if (!painting.current || ctxRef.current === null) return;
    const { offsetX, offsetY } = nativeEvent;

    ctxRef.current.lineWidth = 5;
    ctxRef.current.lineCap = 'round';
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
  }

  function clearWindow() {
    if (ctxRef.current === null || canvasRef.current === null) return;
    ctxRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
  }

  function sendDataUrl(send: Function | undefined) {
    if (send && ctxRef.current !== null) return send(
      ctxRef.current.getImageData(0, 0, 28, 28)
    )
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
