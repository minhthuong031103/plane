/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";


// eslint-disable-next-line no-unused-vars
export default function Cube({ props, handler }) {
  const [ref] = useBox(() => ({ mass: 1, type: 'Kinematic', ...props }));
  useFrame(() => { });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </mesh>
  );
}