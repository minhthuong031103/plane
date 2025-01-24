/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

function VirtualHand() {
  const handRef = useRef();

  // Rotate the hand continuously
  useFrame(() => {
    if (handRef.current) {
      handRef.current.rotation.y += 0.01;
      handRef.current.position.x = Math.sin(handRef.current.rotation.y) * 0.5; // Example movement
    }
  });

  return (
    <mesh ref={handRef} position={[0, 15, 0]} castShadow>
      <boxGeometry args={[10, 8, 10]} />
      <meshStandardMaterial color="#8B0000" />
    </mesh>
  );
}


export default VirtualHand;