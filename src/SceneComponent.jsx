/* eslint-disable react/no-unknown-property */
// eslint-disable-next-line no-unused-vars
import { GridHelper } from "three";

function SceneComponent() {
  const gridSize = 100; // The size of the grid
  const gridDivisions = 100; // Number of lines in one direction

  return (
    <group>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -7, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial />
      </mesh>
      <gridHelper
        args={[gridSize, gridDivisions, "black", "black"]} // Size, divisions, center color, outer lines color
        position={[0, -4.99, 0]} // Slightly above ground to prevent Z-fighting
      />
    </group>
  );
}

export default SceneComponent;
