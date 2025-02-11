/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useFrame } from "@react-three/fiber";
import React, { useState, useRef } from "react";
import { Vector3 } from "three";

const Cube = React.forwardRef((props, ref) => {
  const { position } = props;
  const meshRef = useRef();
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [targetPosition, setTargetPosition] = useState(new Vector3(...position));
  const initialPosition = useRef(new Vector3(...position));

  // Smooth movement
  useFrame(() => {
    if (!meshRef.current) return;

    if (isGrabbed) {
      // Smooth lerp to target position when grabbed
      meshRef.current.position.lerp(targetPosition, 0.3);
    } else {
      // Return to initial position when released
      meshRef.current.position.lerp(initialPosition.current, 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={isGrabbed ? "orange" : "yellow"} />
    </mesh>
  );
});

export default Cube;
