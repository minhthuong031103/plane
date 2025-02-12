/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
// eslint-disable-next-line no-unused-vars
import { Line } from "@react-three/drei";

const FINGERTIPS = {
  THUMB: 4,
  INDEX: 8,
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm base
];

function VirtualHand({ handResult, onGrabStateChange, onPositionUpdate }) {
  const pointsRef = useRef([]);
  const linesRef = useRef([]);
  const [isGrabbing, setIsGrabbing] = useState(false);

  const SCALE = { X: 15, Y: 10, Z: 5 };
  const SPHERE_RADIUS = 0.2;
  const GRAB_THRESHOLD = 6; // Distance threshold for grab detection

  // Calculate pinch point and grab state
  // In VirtualHand.jsx, modify the calculateHandState function:

  const calculateHandState = (handResult) => {
    if (!handResult) return { isGrabbing: false, position: null, thumbPosition: null, indexPosition: null };

    const thumb = handResult[FINGERTIPS.THUMB];
    const index = handResult[FINGERTIPS.INDEX];

    const pinchDistance = Math.sqrt(
      Math.pow((thumb.x - index.x), 2) +
      Math.pow((thumb.y - index.y), 2)
    );

    // Calculate world positions for thumb and index
    const thumbWorldPos = new Vector3(
      (thumb.x * 2 - 1) * SCALE.X,
      -(thumb.y * 2 - 1) * SCALE.Y,
      // thumb.z * SCALE.Z
    );

    const indexWorldPos = new Vector3(
      (index.x * 2 - 1) * SCALE.X,
      -(index.y * 2 - 1) * SCALE.Y,
      index.z * SCALE.Z
    );

    // Calculate midpoint
    const midPoint = new Vector3(
      (thumbWorldPos.x + indexWorldPos.x) / 2,
      (thumbWorldPos.y + indexWorldPos.y) / 2,
      (thumbWorldPos.z + indexWorldPos.z) / 2
    );

    return {
      isGrabbing: (pinchDistance * 100) < GRAB_THRESHOLD,
      position: midPoint,
      thumbPosition: thumbWorldPos,
      indexPosition: indexWorldPos
    };
  };

  useFrame(() => {
    if (!handResult) return;

    // Calculate grab state and position
    const { isGrabbing: newGrabState, position, thumbPosition, indexPosition } = calculateHandState(handResult);

    // If grab state changed, notify parent
    if (newGrabState !== isGrabbing) {
      setIsGrabbing(newGrabState);
      onGrabStateChange?.(newGrabState, thumbPosition, indexPosition);
    }

    // If grabbing, update position
    if (newGrabState && position) {
      onPositionUpdate?.(position);
    }

    // Update hand visualization
    handResult.forEach((point, index) => {
      const pointX = (point.x * 2 - 1) * SCALE.X;
      const pointY = -(point.y * 2 - 1) * SCALE.Y;
      const pointZ = point.z || SCALE.Z;

      if (pointsRef.current[index]) {
        pointsRef.current[index].position.set(pointX, pointY, pointZ);
      }
    });

    // Update lines
    HAND_CONNECTIONS.forEach((connection, index) => {
      const startPoint = handResult[connection[0]];
      const endPoint = handResult[connection[1]];
      if (linesRef.current[index]) {
        linesRef.current[index].geometry.setFromPoints([
          new Vector3(
            (startPoint.x * 2 - 1) * SCALE.X,
            -(startPoint.y * 2 - 1) * SCALE.Y,
            startPoint.z * SCALE.Z
          ),
          new Vector3(
            (endPoint.x * 2 - 1) * SCALE.X,
            -(endPoint.y * 2 - 1) * SCALE.Y,
            endPoint.z * SCALE.Z
          ),
        ]);
      }
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Render landmarks as spheres */}
      {handResult &&
        handResult.map((_, index) => (
          <mesh
            key={`point-${index}`}
            ref={(ref) => (pointsRef.current[index] = ref)}
            castShadow
          >
            <sphereGeometry args={[SPHERE_RADIUS, 16, 16]} />
            <meshStandardMaterial
              color={index === FINGERTIPS.THUMB || index === FINGERTIPS.INDEX ? "blue" : "red"}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}

      {/* Render connections as lines */}
      {HAND_CONNECTIONS.map((_, index) => (
        <line key={`line-${index}`} ref={(ref) => (linesRef.current[index] = ref)}>
          <bufferGeometry />
          <lineBasicMaterial color="black" />
        </line>
      ))}
    </group>
  );
}

export default VirtualHand;