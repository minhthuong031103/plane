/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useFrame } from "@react-three/fiber";
import React, { useState, useRef, useImperativeHandle } from "react";
import { Vector3, Box3 } from "three";

const Cube = React.forwardRef((props, ref) => {
  const { position } = props;
  const meshRef = useRef();
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [targetPosition, setTargetPosition] = useState(new Vector3(...position));
  const initialPosition = useRef(new Vector3(...position));
  const boundingBox = useRef(new Box3());

  // Check if a point is near the cube's surface
  const isPointTouchingCube = (point) => {
    if (!meshRef.current) return false;

    // Update bounding box
    boundingBox.current.setFromObject(meshRef.current);

    // Add small threshold for "touch" detection (0.2 units)
    const threshold = 0.7;
    const expanded = boundingBox.current.clone().expandByScalar(threshold);

    return expanded.containsPoint(point);
  };

  useImperativeHandle(ref, () => ({
    setIsGrabbed: (grabbed) => {
      setIsGrabbed(grabbed);
    },
    setTargetPosition: (position) => {
      if (isGrabbed) {
        setTargetPosition(position);
      }
    },
    checkGrabCollision: (thumbPos, indexPos) => {
      // Only allow grabbing if both fingers are touching the cube
      return isPointTouchingCube(thumbPos) && isPointTouchingCube(indexPos);
    }
  }));

  useFrame(() => {
    if (!meshRef.current) return;

    if (isGrabbed) {
      meshRef.current.position.lerp(targetPosition, 1);
    } else {
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

Cube.displayName = 'Cube';

export default Cube;