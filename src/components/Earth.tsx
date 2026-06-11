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
  const nightTexture = useTexture("/earth-night-texture.jpg")

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
          emissiveMap={nightTexture}
          emissive="#ffffff"
          emissiveIntensity={2}
          onBeforeCompile={(shader) => {
            // 1. Pass the exact world normal from the Vertex Shader to the Fragment Shader
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              "#include <common>\nvarying vec3 vWorldNormal;"
            )
            shader.vertexShader = shader.vertexShader.replace(
              "#include <worldpos_vertex>",
              `#include <worldpos_vertex>
         vWorldNormal = normalize((modelMatrix * vec4(objectNormal, 0.0)).xyz);`
            )

            // 2. Intercept the Emissive Map calculation in the Fragment Shader
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <common>",
              "#include <common>\nvarying vec3 vWorldNormal;"
            )
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <emissivemap_fragment>",
              `
        #ifdef USE_EMISSIVEMAP
          vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
          
          // Sun is hardcoded at X=100, meaning the light travels precisely along vec3(1.0, 0.0, 0.0)
          vec3 sunDirection = vec3(1.0, 0.0, 0.0);
          
          // Calculate how directly this pixel is facing the sun
          float sunDot = dot(vWorldNormal, sunDirection);
          
          // Create the Twilight Mask
          // If sunDot is > 0.1 (Daytime), multiplier is 0.0 (Lights off)
          // If sunDot is < -0.15 (Deep Night), multiplier is 1.0 (Lights on)
          // Anything in between blends smoothly!
          float nightMask = smoothstep(0.1, -0.15, sunDot);
          
          // Apply the mask mathematically to the emissive output
          totalEmissiveRadiance *= emissiveColor.rgb * nightMask;
        #endif
        `
            )
          }}
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
