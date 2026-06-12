import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { DescentState } from "../types/descent"

type DescentCameraAnimatorProps = {
  descentState: DescentState
  onDiveComplete: () => void
}

const EARTH_CENTER = new THREE.Vector3(0, 0, 0)
const DIVE_TIMEOUT_SECONDS = 3.5
const VIDEO_TRIGGER_DISTANCE = 2.2

// Smooth ease-in-out curve for cinematic acceleration and deceleration
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function DescentCameraAnimator({
  descentState,
  onDiveComplete,
}: DescentCameraAnimatorProps) {
  const elapsedRef = useRef(0)
  const completedRef = useRef(false)
  const startPosRef = useRef<THREE.Vector3 | null>(null)
  const targetPosRef = useRef<THREE.Vector3 | null>(null)
  const baseFovRef = useRef<number | null>(null)

  useFrame(({ camera }, delta) => {
    if (descentState !== "diving") {
      elapsedRef.current = 0
      completedRef.current = false
      startPosRef.current = null
      targetPosRef.current = null
      
      // Gracefully reset FOV when returning to orbit
      if (baseFovRef.current && camera.fov !== baseFovRef.current) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, baseFovRef.current, 0.05)
        camera.updateProjectionMatrix()
      }
      return
    }

    // Capture exact starting positions on frame 1 of the dive
    if (!startPosRef.current) {
      startPosRef.current = camera.position.clone()
      baseFovRef.current = camera.fov
      targetPosRef.current = camera.position
        .clone()
        .normalize()
        .multiplyScalar(2.02)
    }

    elapsedRef.current += delta
    
    // Normalize time from 0 to 1
    const t = Math.min(elapsedRef.current / DIVE_TIMEOUT_SECONDS, 1.0)
    const easeT = easeInOutCubic(t)

    // 1. Move Camera with physical easing
    camera.position.lerpVectors(startPosRef.current, targetPosRef.current!, easeT)
    camera.lookAt(EARTH_CENTER)

    // 2. Optical FOV Shifting
    // Math.sin(t * PI) creates a perfect bell curve: 0 at start, 1 in middle, 0 at end
    const velocityCurve = Math.sin(t * Math.PI)
    const maxFovSpike = 120 // How extreme the tunnel vision gets
    
    camera.fov = baseFovRef.current! + (maxFovSpike - baseFovRef.current!) * velocityCurve
    camera.updateProjectionMatrix()

    const reachedTriggerDistance =
      camera.position.distanceTo(EARTH_CENTER) <= VIDEO_TRIGGER_DISTANCE
    const timedOut = elapsedRef.current >= DIVE_TIMEOUT_SECONDS

    if (!completedRef.current && (reachedTriggerDistance || timedOut)) {
      completedRef.current = true
      onDiveComplete()
    }
  })

  return null
}