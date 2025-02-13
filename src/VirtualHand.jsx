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
  const { hand, worldHand } = handResult || {};
  const pointsRef = useRef([]);
  const linesRef = useRef([]);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const groupRef = useRef();

  // Adjusted scale factors for better 3D visualization
  const SCALE = {
    X: 15,
    Y: 10,
    Z: 15
  };

  // Add constants for depth detection
  const DEPTH_THRESHOLDS = {
    CLOSE: 0.3, // Threshold for considering hand close to camera
    INCONSISTENT: 0.16 // Max allowed difference between palm and finger depths
  };


  const WORLD_SCALE = {
    Z: 100 // Adjust this value to fine-tune the Z-axis sensitivity
  };

  const SPHERE_RADIUS = 0.2;
  const GRAB_THRESHOLD = 6;

  const calculateHandState = (hand, palmWorldPoint) => {
    if (!hand) return { isGrabbing: false, position: null, thumbPosition: null, indexPosition: null };

    const thumb = hand[FINGERTIPS.THUMB];
    const index = hand[FINGERTIPS.INDEX];

    const pinchDistance = Math.sqrt(
      Math.pow((thumb.x - index.x), 2) +
      Math.pow((thumb.y - index.y), 2)
    );

    // Calculate world positions for thumb and index
    const thumbWorldPos = new Vector3(
      (thumb.x * 2 - 1) * SCALE.X,
      -(thumb.y * 2 - 1) * SCALE.Y,
      -palmWorldPoint * WORLD_SCALE.Z
    );

    const indexWorldPos = new Vector3(
      (index.x * 2 - 1) * SCALE.X,
      -(index.y * 2 - 1) * SCALE.Y,
      -palmWorldPoint * WORLD_SCALE.Z
    );

    // Calculate midpoint
    const midPoint = new Vector3(
      (thumbWorldPos.x + indexWorldPos.x) / 2,
      (thumbWorldPos.y + indexWorldPos.y) / 2,
      -palmWorldPoint * WORLD_SCALE.Z
    );

    return {
      isGrabbing: (pinchDistance * 100) < GRAB_THRESHOLD,
      position: midPoint,
      thumbPosition: thumbWorldPos,
      indexPosition: indexWorldPos
    };
  };

  const calculateHandDepth = (worldHand) => {
    if (!worldHand) return { isClose: false, isConsistent: true };

    // Calculate average depth of palm (using landmarks 0, 5, 9, 13, 17)
    const palmPoints = [0, 5, 9, 13, 17];
    const palmDepth = palmPoints.reduce((sum, idx) => sum + worldHand[idx].z, 0) / palmPoints.length;

    // Calculate average depth of fingertips
    const fingertipPoints = [FINGERTIPS.THUMB, FINGERTIPS.INDEX, FINGERTIPS.MIDDLE, FINGERTIPS.RING, FINGERTIPS.PINKY];
    const fingertipsDepth = fingertipPoints.reduce((sum, idx) => sum + worldHand[idx].z, 0) / fingertipPoints.length;

    // Check if hand is close to camera
    const isClose = palmDepth < DEPTH_THRESHOLDS.CLOSE;

    // Check for inconsistent depth between palm and fingers
    const depthDifference = Math.abs(palmDepth - fingertipsDepth);
    const isConsistent = depthDifference < DEPTH_THRESHOLDS.INCONSISTENT;

    return {
      isClose,
      isConsistent,
      palmDepth,
      fingertipsDepth
    };
  };

  useFrame(() => {
    if (!hand || !worldHand) return;

    const depthInfo = calculateHandDepth(worldHand);

    // Move the entire hand group based on palm position (landmark 0)
    // const palmPoint = hand[0];
    const palmWorldPoint = worldHand[0];

    if (groupRef.current) {
      // Adjust position based on whether hand is close to camera
      const zScale = depthInfo.isClose ? WORLD_SCALE.Z * 1.5 : WORLD_SCALE.Z;
      groupRef.current.position.set(
        0,
        0,
        -palmWorldPoint.z * zScale
      );
      console.log(zScale)
    }

    // Add depth calculation

    // Update individual points with world coordinates
    hand.forEach((point, index) => {
      const pointX = (point.x * 2 - 1) * SCALE.X;
      const pointY = -(point.y * 2 - 1) * SCALE.Y;
      const worldPoint = worldHand[index];
      // const pointZ = -worldPoint.z * WORLD_SCALE.Z;

      if (pointsRef.current[index]) {
        pointsRef.current[index].position.set(pointX, pointY, 0);
      }
    });


    // Update connections with world coordinates
    HAND_CONNECTIONS.forEach((connection, index) => {
      const startPoint = hand[connection[0]];
      const endPoint = hand[connection[1]];
      const startWorldPoint = worldHand[connection[0]];
      const endWorldPoint = worldHand[connection[1]];

      if (linesRef.current[index]) {
        linesRef.current[index].geometry.setFromPoints([
          new Vector3(
            (startPoint.x * 2 - 1) * SCALE.X,
            -(startPoint.y * 2 - 1) * SCALE.Y,
            // -startWorldPoint.z * WORLD_SCALE.Z
            0
          ),
          new Vector3(
            (endPoint.x * 2 - 1) * SCALE.X,
            -(endPoint.y * 2 - 1) * SCALE.Y,
            // -endWorldPoint.z * WORLD_SCALE.Z
            0
          ),
        ]);
      }
    });

    // Handle grab state and position updates
    const { isGrabbing: newGrabState, position, thumbPosition, indexPosition } = calculateHandState(hand, palmWorldPoint.z);

    if (newGrabState !== isGrabbing) {
      setIsGrabbing(newGrabState);
      onGrabStateChange?.(newGrabState, thumbPosition, indexPosition);
    }

    if (newGrabState && position) {
      onPositionUpdate?.(position);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Render landmarks as spheres */}
      {hand &&
        hand.map((_, index) => (
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