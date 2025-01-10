import React, { useEffect, useRef } from "react";
import { state } from "./state";
import { useSnapshot } from "valtio";

// Move videoRef inside the component and use a separate hook to export its ref.
let exportedVideoRef = null;

export default function VideoInput() {
  const videoRef = useRef(null);
  exportedVideoRef = videoRef; // Assign to exportable variable
  const { currentScene, allowedCamera } = useSnapshot(state);

  useEffect(() => {
    if (!allowedCamera) return;
    async function setupVideo() {
      try {
        const constraints = {
          video: {
            width: 320,
            height: 240,
            frameRate: { ideal: 15, min: 10 },
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    }

    setupVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null; // Free the reference
      }
    };
  }, [allowedCamera]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      width={320}
      height={240}
      style={{ display: "none" }}
    />
  );
}

// Export the video reference
export { exportedVideoRef as videoRef };
