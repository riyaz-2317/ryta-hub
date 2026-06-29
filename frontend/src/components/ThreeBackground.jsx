import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Particles({ chatting = false }) {
  const pointsRef = useRef();
  const count = 1800;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame(({ clock, mouse }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * (chatting ? 0.2 : 0.06);
      pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.08;
      pointsRef.current.position.x = mouse.x * 0.04;
      pointsRef.current.position.y = mouse.y * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#7C3AED" transparent opacity={0.8} />
    </points>
  );
}

function ConnectionLines() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={ref}>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0, 0, 3, 0, 0]), 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#7C3AED" transparent opacity={0.18} />
      </line>
    </group>
  );
}

export default function ThreeBackground({ chatting = false }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <color attach="background" args={['#0A0A0F']} />
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#7C3AED" />
        <Particles chatting={chatting} />
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
