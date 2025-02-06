/* eslint-disable react/no-unknown-property */
import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import * as THREE from "three";

function GrabbableBox({ initialPosition = [0, 0, 0], handResult }) {
  const boxRef = useRef();
  const boxHelperRef = useRef();
  const [isGrabbed, setIsGrabbed] = useState(false);
  const { scene } = useThree(); // Access Three.js scene

  useEffect(() => {
    if (boxRef.current) {
      const boxHelper = new THREE.BoxHelper(boxRef.current, 0x00ff00); // Green wireframe
      scene.add(boxHelper);
      boxHelperRef.current = boxHelper;
    }
  }, [scene]);

  useFrame(() => {
    if (!handResult || !boxRef.current) return;

    const box = boxRef.current;

    // Get Hand Position (Index Finger Tip)
    const handPos = new THREE.Vector3(
      (handResult[8].x * 2 - 1) * 5, // Using index fingertip position
      -(handResult[8].y * 2 - 1) * 5,
      handResult[8].z * 5
    );

    // Create Bounding Box for the Box
    const boxBounding = new THREE.Box3().setFromObject(box);

    // Check if Hand is Inside Bounding Box
    if (boxBounding.containsPoint(handPos)) {
      setIsGrabbed(true);
    } else if (isGrabbed && !boxBounding.containsPoint(handPos)) {
      setIsGrabbed(false);
    }

    // If grabbed, move the box with the hand
    if (isGrabbed) {
      box.position.lerp(handPos, 0.2); // Smooth movement
    }

    // Update Bounding Box Visualization
    if (boxHelperRef.current) {
      boxHelperRef.current.update();
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
