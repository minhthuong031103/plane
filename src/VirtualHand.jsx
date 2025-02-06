/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

import { Line } from "@react-three/drei";
import { useSphere } from "@react-three/cannon";

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm base
];


function convertZValue(z) {
  const SCALE_FACTOR = 10000000;
  let zResult = Math.round(-z * SCALE_FACTOR)
  if (zResult > 5) { // Close
    return (zResult * 2)
  } else { // Far
    return -(zResult * 5)
  }
}

function VirtualHand({ handResult }) {
  const pointRef = useRef([]);
  const lineRef = useRef([]);

  // const zAxisRef = useRef(0);
  const [handPosition, setHandPosition] = useState([0, 0, 0]);


  const SCALE = {
    X: 15,
    Y: 10,
  };


  useFrame(() => {
    if (!handResult) return;

    const newZ = convertZValue(handResult[0].z);

    setHandPosition(([x, y]) => [x, y, newZ]);

    // Update point positions
    handResult.forEach((point, index) => {
      if (pointRef.current) {
        pointRef.current[index].position.set(
          (point.x * 2 - 1) * SCALE.X,
          -(point.y * 2 - 1) * SCALE.Y,
          -point.z * SCALE.Z
        );
      }
    });

    // Update line positions
    HAND_CONNECTIONS.forEach((connection, index) => {
      const startPoint = handResult[connection[0]];
      const endPoint = handResult[connection[1]];
      if (lineRef.current[index]) {
        lineRef.current[index].geometry.setFromPoints([
          new Vector3(
            (startPoint.x * 2 - 1) * SCALE.X,
            -(startPoint.y * 2 - 1) * SCALE.Y,
            -startPoint.z * SCALE.Z
          ),
          new Vector3(
            (endPoint.x * 2 - 1) * SCALE.X,
            -(endPoint.y * 2 - 1) * SCALE.Y,
            -endPoint.z * SCALE.Z
          ),
        ]);
      }
    });


  });

  return (
    <group position={handPosition}>
      {handResult &&
        handResult.map((_, index) => (
          <mesh key={`point-${index}`} ref={(ref) => (pointRef.current[index] = ref)} castShadow>
            <sphereGeometry args={[0.09, 16, 16]} /> {/* Increased sphere size */}
            <meshStandardMaterial color="red" />
          </mesh>
        ))}

      {HAND_CONNECTIONS.map((_, index) => (
        <line key={`line-${index}`} ref={(ref) => (lineRef.current[index] = ref)}>
          <bufferGeometry />
          <lineBasicMaterial color="black" />
        </line>
      ))}
    </group>
  );
}

export default VirtualHand;
