/* eslint-disable react/no-unknown-property */
import { useThree } from "@react-three/fiber";
import { DoubleSide } from "three";
// eslint-disable-next-line no-unused-vars
import { GridHelper } from "three";

function SceneComponent() {
  const { viewport } = useThree();
  const gridSize = 50; // The size of the grid
  const gridDivisions = 50; // Number of lines in one direction

  return (
    <group>
      {/* Ground Plane */}
      <mesh position={[0, -5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[viewport.width, viewport.height, 1]} receiveShadow>
        <planeBufferGeometry args={[10, 10]} />
        <meshBasicMaterial color="#faf9f6" side={DoubleSide} />
      </mesh>

      {/* Grid Helper for Caro-style board */}
      <gridHelper
        args={[gridSize, gridDivisions, "black", "black"]} // Size, divisions, center color, outer lines color
        position={[0, -4.99, 0]} // Slightly above ground to prevent Z-fighting
      />
    </group>
  );
}

export default SceneComponent;
