/* eslint-disable react/no-unknown-property */
import { Canvas, useThree } from "@react-three/fiber";
import React, { useState, useEffect, useRef } from "react";
import VirtualHand from "./VirtualHand.jsx";
import SceneComponent from "./SceneComponent.jsx";
import HandRecognizer from "./HandRegconizer.jsx";
import { OrbitControls } from "@react-three/drei";
import Cube from "./Cube.jsx";

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

function App() {
  const [handResult, setHandResult] = useState(null);
  const cubeRef = useRef();

  // Handlers for grab interaction
  const handleGrabStateChange = (isGrabbing) => {
    if (cubeRef.current) {
      cubeRef.current.setIsGrabbed(isGrabbing);
    }
  };

  const handlePositionUpdate = (position) => {
    if (cubeRef.current) {
      cubeRef.current.setTargetPosition(position);
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
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

      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas
          frameloop="demand"
          shadows
          camera={{
            position: [0, 10, 0],
            rotation: [-Math.PI / 2, 0, 0],
            fov: 75,
          }}
        >
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
          <SceneComponent />
          <VirtualHand
            handResult={handResult}
            onGrabStateChange={handleGrabStateChange}
            onPositionUpdate={handlePositionUpdate}
          />
          <Cube ref={cubeRef} position={[0, 0, 0]} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default App;