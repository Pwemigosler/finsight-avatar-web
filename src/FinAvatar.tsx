import { useMemo, useRef } from "react";
import { Group, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

export interface FinAvatarProps {
  mood?: number;
  speaking?: boolean;
}

const SKIN_COLOR = "#fdd9b5";
const PRIMARY_COLOR = "#4338ca";
const ACCENT_COLOR = "#22d3ee";
const HAIR_COLOR = "#1f2937";

export function FinAvatar({ mood = 0, speaking = false }: FinAvatarProps) {
  const avatarRef = useRef<Group>(null);
  const mouthRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (avatarRef.current) {
      const time = state.clock.elapsedTime;
      avatarRef.current.position.y = Math.sin(time * 1.2) * 0.05;
      avatarRef.current.rotation.y = Math.sin(time * 0.4) * 0.2;
    }

    if (mouthRef.current) {
      const targetScale = speaking ? 1 : 0.3 + mood * 0.2;
      const current = mouthRef.current.scale;
      const lerp = 1 - Math.pow(0.2, delta * 60);
      current.y = current.y + (targetScale - current.y) * lerp;
      current.x = current.x + ((speaking ? 0.7 : 1.2) - current.x) * lerp;
      current.z = current.z + ((speaking ? 0.7 : 1.2) - current.z) * lerp;
    }
  });

  const eyePosition = useMemo(() => [
    new Vector3(-0.17, 1.05, 0.36),
    new Vector3(0.17, 1.05, 0.36),
  ], []);

  return (
    <group ref={avatarRef}>
      <Float
        speed={1.4}
        rotationIntensity={0.2}
        floatIntensity={0.25}
        floatingRange={[-0.04, 0.04]}
      >
        <group>
          <mesh position={[0, 1.02, 0]} castShadow>
            <sphereGeometry args={[0.45, 48, 48]} />
            <meshStandardMaterial color={SKIN_COLOR} roughness={0.5} />
          </mesh>

          <mesh position={[0, 1.22, -0.02]} castShadow>
            <sphereGeometry args={[0.48, 48, 48]} />
            <meshStandardMaterial color={HAIR_COLOR} metalness={0.1} roughness={0.6} />
          </mesh>

          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.32, 0.42, 1.1, 32]} />
            <meshStandardMaterial color={PRIMARY_COLOR} metalness={0.05} roughness={0.6} />
          </mesh>

          <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.28, 0.34, 0.5, 24]} />
            <meshStandardMaterial color={PRIMARY_COLOR} />
          </mesh>

          <mesh position={[0.45, 0.35, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.15, 0.9, 0.22]} />
            <meshStandardMaterial color={PRIMARY_COLOR} />
          </mesh>

          <mesh position={[-0.45, 0.35, 0]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.15, 0.9, 0.22]} />
            <meshStandardMaterial color={PRIMARY_COLOR} />
          </mesh>

          {eyePosition.map((pos, index) => (
            <group key={index} position={pos.toArray()}>
              <mesh>
                <sphereGeometry args={[0.085, 24, 24]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0, 0.04]}>
                <sphereGeometry args={[0.045, 18, 18]} />
                <meshStandardMaterial color="#111827" />
              </mesh>
            </group>
          ))}

          <group ref={mouthRef} position={[0, 0.88, 0.43]} scale={[1.2, 0.3, 1.2]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.05, 16, 32, Math.PI]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>

          <mesh position={[0, 1.34, 0.25]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={ACCENT_COLOR} emissive={ACCENT_COLOR} emissiveIntensity={0.35} />
          </mesh>

          <group position={[0, -0.82, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
              <ringGeometry args={[0.5, 0.58, 64]} />
              <meshStandardMaterial color="#0f172a" opacity={0.3} transparent />
            </mesh>
          </group>
        </group>
      </Float>
    </group>
  );
}

export default FinAvatar;
