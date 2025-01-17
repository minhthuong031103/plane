import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from "react";

let detectionInterval;
// eslint-disable-next-line react/prop-types
export default function HandRecognizer({ setHandResults }) {
  const videoRef = useRef();
  const canvasRef = useRef(null);
  const controlCanvasRef = useRef(null);

  useEffect(() => {
    initVideoAndModel();

    return () => clearInterval(detectionInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initVideoAndModel = async () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (!videoElement || !canvasElement) return;

    await initVideo(videoElement);
    const handLandmarker = await initModel();

    const canvasCtx = canvasElement.getContext("2d");

    detectionInterval = setInterval(() => {
      const detections = handLandmarker.detectForVideo(
        videoElement,
        Date.now()
      );
      processDetections(detections, setHandResults, canvasCtx, canvasElement);
      handleControls(detections, controlCanvasRef.current);
    }, 200);
  };

  return (
    <div className="relative">
      <video
        className="absolute -scale-x-1 border-2 border-stone-800 rounded-lg"
        ref={videoRef}
        width="640"
        height="480"
      ></video>
      <canvas
        className="absolute -scale-x-1 border-2 border-stone-800 rounded-lg"
        ref={canvasRef}
        width="640"
        height="480"
        style={{ pointerEvents: "none" }}
      ></canvas>
      <canvas
        className="absolute z-10 border-2 border-blue-800 rounded-lg"
        ref={controlCanvasRef}
        width="300"
        height="300"
        style={{ pointerEvents: "none", top: "500px", left: "20px" }}
      ></canvas>
    </div>
  );
}

async function initVideo(videoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
  });
  videoElement.srcObject = stream;
  videoElement.addEventListener("loadeddata", () => videoElement.play());
}

async function initModel() {
  const wasm = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
  return HandLandmarker.createFromOptions(
    wasm,
    {
      baseOptions:
      {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      numHands: 1,
      runningMode: "VIDEO",
    });
}

function processDetections(detections, setHandResults, canvasCtx, canvasElement) {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (detections && detections.landmarks && detections.landmarks.length > 0) {
    const hand = detections.landmarks[0];

    // Draw landmarks on the canvas
    hand.forEach((landmark) => {
      const x = landmark.x * canvasElement.width; // Convert normalized x to canvas space
      const y = landmark.y * canvasElement.height; // Convert normalized y to canvas space

      canvasCtx.beginPath(); // Start a new drawing path
      canvasCtx.arc(x, y, 5, 0, 2 * Math.PI); // Draw a circle (dot) at the landmark
      canvasCtx.fillStyle = "white"; // Set fill color
      canvasCtx.fill(); // Fill the circle with white color
    });

    // Draw skeleton by connecting landmarks
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index finger
      [5, 9], [9, 10], [10, 11], [11, 12],  // Middle finger
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring finger
      [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [0, 17], [0, 5]                        // Palm base
    ];

    connections.forEach(([start, end]) => {
      const startX = hand[start].x * canvasElement.width;
      const startY = hand[start].y * canvasElement.height;
      const endX = hand[end].x * canvasElement.width;
      const endY = hand[end].y * canvasElement.height;

      canvasCtx.beginPath();
      canvasCtx.moveTo(startX, startY);
      canvasCtx.lineTo(endX, endY);
      canvasCtx.strokeStyle = "white";
      canvasCtx.lineWidth = 2;
      canvasCtx.stroke();
    });

    // Pass the processed results
    setHandResults(hand);
  } else {
    console.log("No hand landmarks detected.");
    setHandResults(null);
  }
}


function handleControls(detections, controlCanvas) {
  if (!controlCanvas || !detections || !detections.landmarks) return;

  const ctx = controlCanvas.getContext("2d");
  ctx.clearRect(0, 0, controlCanvas.width, controlCanvas.height);

  const hand = detections.landmarks[0];
  if (!hand) return;

  const palmBase = hand[0]; // Palm base is often index 0
  const x = palmBase.x * controlCanvas.width;
  const y = palmBase.y * controlCanvas.height;

  // Draw the control point
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();

  // Determine control directions
  const centerX = controlCanvas.width / 2;
  const centerY = controlCanvas.height / 2;
  const threshold = 50; // Movement threshold

  if (x < centerX - threshold) {
    logKeyPress("KeyA"); // Move left
    simulateKeyPress("KeyA");
  } else if (x > centerX + threshold) {
    logKeyPress("KeyD"); // Move right
    simulateKeyPress("KeyD");
  }

  if (y < centerY - threshold) {
    logKeyPress("KeyW"); // Move up
    simulateKeyPress("KeyW");
  } else if (y > centerY + threshold) {
    logKeyPress("KeyS"); // Move down
    simulateKeyPress("KeyS");
  }

  // Draw the control area
  ctx.beginPath();
  ctx.rect(centerX - threshold, centerY - threshold, threshold * 2, threshold * 2);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function simulateKeyPress(key) {
  const event = new KeyboardEvent("keydown", { key });
  document.dispatchEvent(event);
}

function logKeyPress(key) {
  console.log(`Key Pressed: ${key}`);
}
