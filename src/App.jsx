/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import VirtualHand from "./VirtualHand.jsx";
import SceneComponent from "./SceneComponent.jsx";
import HandRecognizer from "./HandRegconizer.jsx";
import GrabbableBox from "./GrabbableBox.jsx";
import { OrbitControls } from "@react-three/drei";

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
          width: "500px", // Set width here
          height: "300px", // Set height here
          zIndex: 10, // Ensures it stays on top of the game
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "rgba(0, 0, 0, 0.2)", // Optional semi-transparent background
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
            position: [0, 2, 5],
            fov: 60,
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[2, 5, 2]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Components */}
          <group>
            <SceneComponent />
            <VirtualHand handResult={handResult} />

            {/* Add Grabbable Boxes */}
            <GrabbableBox initialPosition={[0, 0, 0]} handResult={handResult} />
            <GrabbableBox initialPosition={[1, 0, 0]} handResult={handResult} />
            <GrabbableBox initialPosition={[-1, 0, 0]} handResult={handResult} />
          </group>

          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
