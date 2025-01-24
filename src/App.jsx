/* eslint-disable react/no-unknown-property */
import { Canvas } from "@react-three/fiber";

import SceneComponent from "./SceneComponent.jsx";
import VirtualHand from "./VirtualHand.jsx";
import { OrbitControls } from "@react-three/drei";

function App() {
  return (
    <div>
      <Canvas
        shadows // Enable shadows
        style={{ height: "100vh", width: "100vw" }}
        camera={{
          position: [0, 5, 100], // Position the camera far and high
          fov: 50, // Adjust field of view
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
          <VirtualHand />
        </group>
        {/* <OrbitControls /> */}
      </Canvas>
    </div>
  );
}

export default App;
