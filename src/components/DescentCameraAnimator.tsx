import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { DescentState } from "../types/descent"

type DescentCameraAnimatorProps = {
  descentState: DescentState
  onDiveComplete: () => void
}

const EARTH_CENTER = new THREE.Vector3(0, 0, 0)
// Slower, more cinematic descent speed
const DIVE_SPEED = 2.0
const DIVE_TIMEOUT_SECONDS = 3.5
// Triggers the video BEFORE clipping into the Earth
const VIDEO_TRIGGER_DISTANCE = 2.2

export function DescentCameraAnimator({
  descentState,
  onDiveComplete,
}: DescentCameraAnimatorProps) {
  const elapsedRef = useRef(0)
  const completedRef = useRef(false)
  const targetRef = useRef<THREE.Vector3 | null>(null)

  useFrame(({ camera }, delta) => {
    if (descentState !== "diving") {
      elapsedRef.current = 0
      completedRef.current = false
      targetRef.current = null
      return
    }

    if (!targetRef.current) {
      // Lock the target strictly to the outer atmosphere layer (2.02)
      // This guarantees the camera NEVER clips inside the planet to see the stars
      targetRef.current = camera.position
        .clone()
        .normalize()
        .multiplyScalar(2.02)
    }

    elapsedRef.current += delta

    // Exponential lerp creates a beautiful "easing" effect as it approaches the clouds
    const lerpFactor = 1 - Math.exp(-DIVE_SPEED * delta)
    camera.position.lerp(targetRef.current, lerpFactor)
    camera.lookAt(EARTH_CENTER)

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
