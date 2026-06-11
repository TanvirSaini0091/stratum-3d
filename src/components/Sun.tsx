import { useRef } from "react"
import { SUN_POSITION } from "../constants"
import * as THREE from "three"

export function Sun() {
  const lightRef = useRef<THREE.DirectionalLight>(null)

  return (
    <group>
      <mesh position={SUN_POSITION}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#ffedd6" />
      </mesh>

      <directionalLight
        ref={lightRef}
        position={SUN_POSITION}
        intensity={3.5}
        color="#ffedd6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-40, 40, 40, -40, 0.1, 500]}
        />
      </directionalLight>
    </group>
  )
}
