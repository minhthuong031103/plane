/* eslint-disable react/no-unknown-property */
// eslint-disable-next-line no-unused-vars
import { GridHelper } from "three";
import { usePlane } from "@react-three/cannon";


function SceneComponent(props) {
  const gridSize = 50; // The size of the grid
  const gridDivisions = 50; // Number of lines in one direction
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -5, 0], ...props }));

  return (
    <group>
      {/* Ground Plane */}
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial />
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
