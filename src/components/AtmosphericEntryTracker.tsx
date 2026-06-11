import {
  useMemo,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export type EntryCoordinates = {
  latitude: number
  longitude: number
  maxZoomReached: boolean
}

type AtmosphericEntryTrackerProps = {
  earthRef: RefObject<THREE.Mesh | null>
  minDistance: number
  setEntryCoordinates: Dispatch<SetStateAction<EntryCoordinates | null>>
}

const CENTER_SCREEN_NDC = new THREE.Vector2(0, 0)
const MAX_ZOOM_EPSILON = 0.01

function normalizeLongitude(longitude: number) {
  return ((((longitude + 180) % 360) + 360) % 360) - 180
}

function localPointToLatLon(point: THREE.Vector3) {
  const normalizedPoint = point.clone().normalize()

  /*
   * The Earth mesh uses Three.js's Y-up sphere coordinates:
   * - latitude is the vertical angle from the equator, so asin(y / radius).
   * - longitude is the angle around the Y axis. We use atan2(-z, x) so that
   *   positive X is 0 degrees longitude and positive longitude rotates east.
   */
  const latitude = THREE.MathUtils.radToDeg(Math.asin(normalizedPoint.y))
  const longitude = normalizeLongitude(
    THREE.MathUtils.radToDeg(Math.atan2(-normalizedPoint.z, normalizedPoint.x))
  )

  return { latitude, longitude }
}

export function AtmosphericEntryTracker({
  earthRef,
  minDistance,
  setEntryCoordinates,
}: AtmosphericEntryTrackerProps) {
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  useFrame(({ camera }) => {
    const earth = earthRef.current
    if (!earth) return

    const maxZoomReached =
      camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) <=
      minDistance + MAX_ZOOM_EPSILON

    if (!maxZoomReached) {
      setEntryCoordinates((previous) =>
        previous?.maxZoomReached ? null : previous
      )
      return
    }

    /*
     * NDC (0, 0) is the exact center of the canvas. The raycaster projects that
     * point through the active camera and gives us the first surface hit on the
     * solid Earth mesh, ignoring the cloud and atmosphere shells.
     */
    raycaster.setFromCamera(CENTER_SCREEN_NDC, camera)
    const [intersection] = raycaster.intersectObject(earth, false)

    if (!intersection) {
      setEntryCoordinates({
        latitude: Number.NaN,
        longitude: Number.NaN,
        maxZoomReached: true,
      })
      return
    }

    /*
     * The intersection is returned in world space, where the Earth parent group
     * has a 23.5 degree Z-axis axial tilt and the mesh is rotating over time.
     * Converting the hit point into the mesh's local space applies the inverse
     * matrixWorld, removing both transforms before spherical conversion.
     */
    const localIntersectionPoint = earth.worldToLocal(
      intersection.point.clone()
    )
    const { latitude, longitude } = localPointToLatLon(localIntersectionPoint)

    setEntryCoordinates((previous) => {
      if (
        previous?.maxZoomReached &&
        Math.abs(previous.latitude - latitude) < 0.0001 &&
        Math.abs(previous.longitude - longitude) < 0.0001
      ) {
        return previous
      }

      return { latitude, longitude, maxZoomReached: true }
    })
  })

  return null
}
