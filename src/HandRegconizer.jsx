import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { useEffect, useRef } from "react";

let detectionInterval;
// eslint-disable-next-line react/prop-types
export default function HandRecognizer({ setHandResults }) {
  const videoRef = useRef();
  const canvasRef = useRef(null);

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
    }, 200);
  };

  return (
    <div className="relative">
      <video
        className="absolute -scale-x-1 border-2 border-stone-800 rounded-lg"
        ref={videoRef}
        width="300"
        height="250"
      ></video>
      <canvas
        className="absolute -scale-x-1 border-2 border-stone-800 rounded-lg"
        ref={canvasRef}
        width="300"
        height="250"
        style={{ pointerEvents: "none" }}
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

function processDetections(detections, setHandResults) {
  if (detections && detections.landmarks && detections.landmarks.length > 0) {
    const hand = detections.landmarks[0];

    setHandResults(hand);
  } else {
    console.log("No hand landmarks detected.");
    setHandResults(null);
  }
}
