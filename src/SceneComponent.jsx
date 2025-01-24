/* eslint-disable react/no-unknown-property */
import { useThree } from "@react-three/fiber";
import { DoubleSide } from "three";


function SceneComponent() {
  const { viewport } = useThree()

  return (
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[viewport.width, viewport.height, 1]} receiveShadow>
      <planeBufferGeometry args={[10, 10]} />
      <meshBasicMaterial color="#faf9f6" side={DoubleSide} />
    </mesh>
  );
}


export default SceneComponent;