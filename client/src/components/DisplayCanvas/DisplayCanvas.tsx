import React, { useRef, useEffect, useState } from 'react';
import './DisplayCanvas.css';
import { ReactComponent as BrainSVG } from '../../assets/svg/brain.svg';
import { ReactComponent as ClearSvg } from '../../assets/svg/clear.svg';

type Predict = {
  detectedNumberCNN: number;
  detectionsCNN: number[];
};

type DisplayCanvasProps = {
  predict: Predict | null;
  prediction: Function;
  clearPredict: Function;
};

const DEFAULT_DRAWING_BOX = {
  maxX: 0,
  maxY: 0,
  minX: Number.MAX_SAFE_INTEGER,
  minY: Number.MAX_SAFE_INTEGER,
};

const LINE_WIDTH = 24;
const COPY_CANVAS_SIZE = {
  width: 28,
  height: 28,
};

const MNIST_BOX_SIZE = {
  width: 20,
  heigth: 20,
};

const STROKE_STYLE = '#97a7c3'

export function DisplayCanvas({
  predict,
  prediction,
  clearPredict,
}: DisplayCanvasProps) {
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

  function startPosition(e: React.MouseEvent | React.TouchEvent) {
    painting.current = true;
    draw(e);
  }

  function finishPosition() {
    painting.current = false;
    ctxRef.current !== null && ctxRef.current.beginPath();
  }

  function draw({ nativeEvent }: React.MouseEvent | React.TouchEvent) {
    if (
      !painting.current ||
      ctxRef.current === null ||
      canvasRef.current === null
    )
      return;

    const event = nativeEvent instanceof MouseEvent
      ? nativeEvent
      : nativeEvent.touches[0]

    const { left, top } = canvasRef.current.getBoundingClientRect();

    const x = event.clientX - left;
    const y = event.clientY - top;

    ctxRef.current.lineWidth = LINE_WIDTH;
    ctxRef.current.lineCap = 'round';
    ctxRef.current.strokeStyle = STROKE_STYLE;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);

    setDrawingBox((box) => ({
      maxX: Math.max(box.maxX, x),
      maxY: Math.max(box.maxY, y),
      minX: Math.min(box.minX, x),
      minY: Math.min(box.minY, y),
    }));
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

  function sendDataUrl(send: Function | void) {
    if (!send) return;
    const imageData = reScaleImageData();
    return imageData && imageData !== null ? send(imageData) : null;
  }

  function reScaleImageData(): ImageData | null | void {
    if (ctxRef.current === null || canvasRef.current === null) return;
    const canvasCopy = document.createElement('canvas');
    const { width: imageWidth, height: imageHeigth } = COPY_CANVAS_SIZE;
    const {
      width: mnistBoxSizeWidth,
      heigth: mnistBoxSizeHeight,
    } = MNIST_BOX_SIZE;
    canvasCopy.width = imageWidth;
    canvasCopy.height = imageHeigth;
    const copyContext = canvasCopy.getContext('2d');
    const ratioX = canvasRef.current.width / imageWidth;
    const ratioY = canvasRef.current.height / imageHeigth;
    const scaledSourceWidth = Math.min(
      mnistBoxSizeWidth,
      Math.max(4, (drawingBox.maxX - drawingBox.minX + LINE_WIDTH) / ratioX),
    );
    const scaledSourceHeight = Math.min(
      mnistBoxSizeHeight,
      (drawingBox.maxY - drawingBox.minY + LINE_WIDTH) / ratioY,
    );
    const dx = (imageWidth - scaledSourceWidth) / 2;
    const dy = (imageHeigth - scaledSourceHeight) / 2;

    copyContext &&
      copyContext.drawImage(
        canvasRef.current,
        drawingBox.minX - LINE_WIDTH / 2,
        drawingBox.minY - LINE_WIDTH / 2,
        drawingBox.maxX - drawingBox.minX + LINE_WIDTH / 2,
        drawingBox.maxY - drawingBox.minY + LINE_WIDTH / 2,
        dx,
        dy,
        scaledSourceWidth,
        scaledSourceHeight,
      );
    return copyContext
      ? copyContext.getImageData(0, 0, imageWidth, imageHeigth)
      : null;
  }

  const mystyles = (num: number) =>
    ({
      '--s-height': `${num < 10 ? 10 : num}%`,
    } as React.CSSProperties);

  const predictStyles = (i: number) =>
    predict !== null
      ? mystyles(Math.floor(predict.detectionsCNN[i] * 100))
      : mystyles(10);

  return (
    <>
      <div className="display display_statistic">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="statistic">
            <div
              key={`el${i}`}
              className="statistic__bar"
              style={predictStyles(i)}
            >
              <div className="statistic__bar-toggler"></div>
            </div>
            <span
              className={
                predict !== null && i === predict.detectedNumberCNN
                  ? `statistic__number predicted`
                  : `statistic__number`
              }
            >
              {i}
            </span>
          </div>
        ))}
      </div>
      <div className="display display_draw">
        <canvas
          className="display__canvas"
          onTouchStart={startPosition}
          onTouchEnd={finishPosition}
          onTouchMove={draw}
          onMouseDown={startPosition}
          onMouseUp={finishPosition}
          onMouseMove={draw}
          ref={canvasRef}
        />
      </div>
      <div className="display_btn-wrapper">
        <button
          title="clear"
          className="display_btn btn_clear"
          onClick={() => {
            clearWindow();
            clearPredict();
          }}
          >
          <i>
            <ClearSvg />
          </i>
        </button>
        <button
          disabled={!painting.current}
          title="predict"
          className="display_btn"
          onClick={() => sendDataUrl(prediction)}
        >
          <i>
            <BrainSVG />
          </i>
        </button>
      </div>
    </>
  );
}
