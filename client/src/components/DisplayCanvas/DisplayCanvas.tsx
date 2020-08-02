import React, { useRef, useEffect, MouseEvent } from 'react';
import './DisplayCanvas.css';

export function DisplayCanvas() {
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

  function startPosition(e: MouseEvent) {
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

  function draw({ nativeEvent }: MouseEvent) {
    if (!painting.current || ctxRef.current === null) return;
    const { offsetX, offsetY } = nativeEvent;

    ctxRef.current.lineWidth = 5;
    ctxRef.current.lineCap = 'round';
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
  }

  return (
    <div className="display">
      <canvas
        className="display__canvas"
        onMouseDown={startPosition}
        onMouseUp={finishPosition}
        onMouseMove={draw}
        ref={canvasRef}
      />
    </div>
  );
}
