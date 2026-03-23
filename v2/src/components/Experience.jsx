import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, MeshDistortMaterial } from '@react-three/drei';

const Experience = () => {
  const cubeRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (cubeRef.current) {
      cubeRef.current.rotation.x = time * 0.2;
      cubeRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={cubeRef} position={[4, 2, -5]}>
          <boxGeometry args={[4, 4, 4]} />
          <MeshDistortMaterial
            color="#3b82f6"
            speed={2}
            distort={0.4}
            radius={1}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
        <mesh position={[-5, -2, -8]}>
          <sphereGeometry args={[5, 64, 64]} />
          <MeshDistortMaterial
            color="#2dd4bf"
            speed={3}
            distort={0.5}
            radius={1}
          />
        </mesh>
      </Float>

      {/* Decorative text or objects can be added here */}
    </>
  );
};

export default Experience;
