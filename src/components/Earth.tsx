import * as THREE from "three"
import { useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import { SPHERE_SEGMENTS } from "../constants"

type EarthProps = {
  earthRef?: RefObject<THREE.Mesh | null>
}

export function Earth({ earthRef }: EarthProps) {
  const earthTexture = useTexture("/earth-texture.jpg")
  const cloudsTexture = useTexture("/clouds-texture.jpg")

  const localEarthRef = useRef<THREE.Mesh>(null)
  const resolvedEarthRef = earthRef ?? localEarthRef
  const cloudsRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    if (resolvedEarthRef.current)
      resolvedEarthRef.current.rotation.y = elapsedTime * 0.015
    if (cloudsRef.current) cloudsRef.current.rotation.y = elapsedTime * 0.018
  })

  const axialTilt = 23.5 * (Math.PI / 180)

  return (
    <group rotation={[0, 0, axialTilt]}>
      <mesh ref={resolvedEarthRef} castShadow>
        <sphereGeometry args={[2, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.01, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent={true}
          opacity={0.5}
          depthWrite={false}
          polygonOffset={true}
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.02, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
        <meshStandardMaterial
          color="#3a90ff"
          transparent={true}
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          roughness={1}
          polygonOffset={true}
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>
    </group>
  )
}
