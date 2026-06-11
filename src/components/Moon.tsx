import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"
import { SPHERE_SEGMENTS } from "../constants"

export function Moon({ speedMultiplier = 1 }: { speedMultiplier?: number }) {
  const moonTexture = useTexture("/moon-texture.jpg")
  const orbitRef = useRef<THREE.Group>(null)
  const moonRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    if (orbitRef.current) {
      orbitRef.current.rotation.y = elapsedTime * (0.002 * speedMultiplier)
    }
    if (moonRef.current) {
      moonRef.current.rotation.y = elapsedTime * (0.005 * speedMultiplier)
    }
  })

  return (
    <group ref={orbitRef} rotation={[0, 0, 0]}>
      <mesh ref={moonRef} position={[20, 0, 0]} receiveShadow>
        <sphereGeometry args={[0.54, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshStandardMaterial
          map={moonTexture}
          roughness={1}
          metalness={0}
          emissive="#4a0000"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}
