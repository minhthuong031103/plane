/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { Line } from "@react-three/drei"; // Use Line from drei


// Define hand landmark connections
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm base
];

function VirtualHand({ handResult }) {
  const pointsRef = useRef([]);
  const linesRef = useRef([]);

  const SCALE = 5;  // Scale the hand to be larger
  const HAND_POSITION = [0, 0, -5];  // Move hand closer to the camera

  useFrame(() => {
    if (!handResult) return;

    // Update landmark positions
    handResult.forEach((point, index) => {
      if (pointsRef.current[index]) {
        pointsRef.current[index].position.set(
          (point.x * 2 - 1) * SCALE,  // Scale x
          -(point.y * 2 - 1) * SCALE,  // Scale y and invert for Three.js
          point.z * SCALE // Scale z
        );
      }
    });

    // Update line positions
    HAND_CONNECTIONS.forEach((connection, index) => {
      const startPoint = handResult[connection[0]];
      const endPoint = handResult[connection[1]];
      if (linesRef.current[index]) {
        linesRef.current[index].geometry.setFromPoints([
          new Vector3(
            (startPoint.x * 2 - 1) * SCALE,
            -(startPoint.y * 2 - 1) * SCALE,
            startPoint.z * SCALE
          ),
          new Vector3(
            (endPoint.x * 2 - 1) * SCALE,
            -(endPoint.y * 2 - 1) * SCALE,
            endPoint.z * SCALE
          ),
        ]);
      }
    });
  });

  return (
    <group position={HAND_POSITION}>
      {/* Render landmarks as spheres */}
      {handResult &&
        handResult.map((_, index) => (
          <mesh key={`point-${index}`} ref={(ref) => (pointsRef.current[index] = ref)} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} /> {/* Increased sphere size */}
            <meshStandardMaterial color="red" />
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
