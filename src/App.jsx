/* eslint-disable react/no-unknown-property */
import { Canvas, useThree } from "@react-three/fiber";
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import VirtualHand from "./VirtualHand.jsx";
import SceneComponent from "./SceneComponent.jsx";
import HandRecognizer from "./HandRegconizer.jsx";
import { OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import Cube from "./Cube.jsx";

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 20); // Move camera to be in front of the hand
    camera.lookAt(0, 0, 0); // Ensure camera is looking at the hand
  }, [camera]);

  return null; // This component only updates the camera
}

function App() {
  const [handResult, setHandResult] = useState(null);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* HandRecognizer (Top Left Overlay) */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "500px",
          height: "300px",
          zIndex: 10,
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          padding: "5px",
        }}
      >
        <HandRecognizer setHandResults={setHandResult} />
      </div>

      {/* Game Scene (Full Screen Canvas) */}
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas
          shadows
          camera={{
            position: [0, 10, 0], // Position camera above the scene
            rotation: [-Math.PI / 2, 0, 0], // Rotate camera to look down
            fov: 75,
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
          />
          <CameraSetup />
          {/* Components */}
          <Physics>
            <SceneComponent />
            <VirtualHand handResult={handResult} />
            {Array(5)
              .fill()
              .map((element, index) => (
                <Cube
                  props={{ position: [0, 5 * index, 0] }}
                  key={index}
                />
              ))}
          </Physics>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default App;


