import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import React, { useEffect, useRef } from "react";

let detectionInterval;
export default function HandRecognizer({ setHandResults }) {
  const videoRef = useRef();

  useEffect(() => {
    initVideoAndModel();

    return () => clearInterval(detectionInterval);
  }, []);

  const initVideoAndModel = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    await initVideo(videoElement);
    const handLandmarker = await initModel();

    detectionInterval = setInterval(() => {
      const detections = handLandmarker.detectForVideo(
        videoElement,
        Date.now()
      );
      processDetections(detections, setHandResults);
    }, 1000 / 30); //this will run every 30 frames per second
  };

  return (
    <div className="absolute">
      <video
        className="-scale-x-1 border-2 border-stone-800 rounded-lg"
        ref={videoRef}
        width="120"
        height="120"
      ></video>
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
  const wasm = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  return HandLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    numHands: 1,
    runningMode: "VIDEO",
  });
}
let smoothedTilt = 0;
let smoothedDegrees = 0;

function smoothInput(currentValue, previousValue, smoothingFactor) {
  return previousValue + (currentValue - previousValue) * smoothingFactor;
}

function processDetections(detections, setHandResults) {
  if (detections && detections.landmarks && detections.landmarks.length > 0) {
    const hand = detections.landmarks[0];
    const { x: wristX, y: wristY } = hand[0];
    const { x: indexX, y: indexY } = hand[5];

    const tilt = (indexY - wristY) / (indexX - wristX);
    const degrees = (Math.atan(tilt) * 180) / Math.PI;

    // Apply smoothing
    smoothedTilt = smoothInput(tilt, smoothedTilt, 0.1);
    smoothedDegrees = smoothInput(degrees, smoothedDegrees, 0.1);

    setHandResults({ tilt: smoothedTilt, degrees: smoothedDegrees });
  } else {
    setHandResults({ tilt: 0, degrees: 0 });
  }
}
