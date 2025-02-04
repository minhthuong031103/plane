/* eslint-disable react/no-unknown-property */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import * as THREE from "three";

function GrabbableBox({ initialPosition = [0, 0, 0], handResult }) {
  const boxRef = useRef();
  const [isGrabbed, setIsGrabbed] = useState(false);

  useFrame(() => {
    if (!handResult || !boxRef.current) return;

    const box = boxRef.current;
    const handPos = new THREE.Vector3(
      (handResult[8].x * 2 - 1) * 5, // Using index fingertip position
      -(handResult[8].y * 2 - 1) * 5,
      handResult[8].z * 5
    );

    // Get box position
    const boxPos = new THREE.Vector3();
    box.getWorldPosition(boxPos);

    // Calculate distance between hand and box
    const distance = boxPos.distanceTo(handPos);

    if (distance < 0.5) {
      setIsGrabbed(true);
    } else if (isGrabbed && distance > 1) {
      setIsGrabbed(false);
    }

    // If grabbed, move the box with hand
    if (isGrabbed) {
      box.position.lerp(handPos, 0.2); // Smooth movement
    }
  });

  return (
    <Box
      ref={boxRef}
      args={[0.5, 0.5, 0.5]} // Box size
      position={initialPosition}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={isGrabbed ? "red" : "orange"} />
    </Box>
  );
}

export default GrabbableBox;
