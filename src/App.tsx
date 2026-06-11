import { Suspense, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Pause, Play } from "lucide-react"
import * as THREE from "three"
import { Earth } from "./components/Earth"
import { Moon } from "./components/Moon"
import { Sun } from "./components/Sun"
import {
  AtmosphericEntryTracker,
  type EntryCoordinates,
} from "./components/AtmosphericEntryTracker"
import { useReverseGeocode } from "./hooks/useReverseGeocode"

const ORBIT_MIN_DISTANCE = 3.5

function CoordinateOverlay({
  coordinates,
  rotationPaused,
  onToggleRotation,
}: {
  coordinates: EntryCoordinates | null
  rotationPaused: boolean
  onToggleRotation: () => void
}) {
  const hasCoordinates =
    coordinates &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude)
  const isLocked = coordinates?.maxZoomReached ?? false
  const reverseGeocode = useReverseGeocode(
    coordinates?.latitude,
    coordinates?.longitude,
    isLocked
  )
  const isScanning =
    isLocked &&
    (reverseGeocode.isLoading ||
      reverseGeocode.status === "scanning" ||
      !reverseGeocode.location)
  const locationLabel = isScanning
    ? "Scanning topography..."
    : reverseGeocode.location
  const descentTarget = reverseGeocode.location ?? "Unknown Sector"

  function handleInitiateDescent() {
    console.log("Descent initiated to: ", descentTarget)
  }

  return (
    <div className="pointer-events-none absolute top-4 left-4 z-10 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-white/15 bg-black/65 px-4 py-3 font-mono text-xs text-white shadow-xl backdrop-blur-md">
      <div className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-white/55 uppercase">
        Atmospheric Entry
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            coordinates?.maxZoomReached ? "bg-emerald-400" : "bg-white/30"
          }`}
        />
        <span>
          {coordinates?.maxZoomReached
            ? "Max zoom reached"
            : "Awaiting max zoom"}
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-white/80">
        <dt>Lat</dt>
        <dd className="text-right text-white">
          {hasCoordinates ? coordinates.latitude.toFixed(6) : "--"}
        </dd>
        <dt>Lon</dt>
        <dd className="text-right text-white">
          {hasCoordinates ? coordinates.longitude.toFixed(6) : "--"}
        </dd>
      </dl>
      <button
        type="button"
        className="pointer-events-auto mt-3 flex w-full items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-white/85 uppercase transition-colors hover:border-white/30 hover:bg-white/10"
        onClick={onToggleRotation}
      >
        {rotationPaused ? (
          <Play aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <Pause aria-hidden="true" className="h-3.5 w-3.5" />
        )}
        {rotationPaused ? "Resume Rotation" : "Stop Rotation"}
      </button>
      {isLocked && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">
            Resolved Location
          </div>
          <div
            className={`mt-1 text-sm ${
              reverseGeocode.isLoading ? "text-white/60" : "text-white"
            }`}
          >
            {locationLabel}
          </div>
          <button
            type="button"
            className="pointer-events-auto mt-3 w-full rounded border border-emerald-300/45 bg-emerald-300/10 px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-emerald-100 uppercase transition-colors hover:border-emerald-200 hover:bg-emerald-300/20 disabled:cursor-wait disabled:border-white/15 disabled:bg-white/5 disabled:text-white/40"
            disabled={isScanning}
            onClick={handleInitiateDescent}
          >
            Initiate Descent To {descentTarget}
          </button>
        </div>
      )}
    </div>
  )
}

function Crosshair({ isLocked }: { isLocked: boolean }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      {/* Dynamic targeting reticle */}
      <div
        className={`relative flex h-8 w-8 items-center justify-center transition-colors duration-300 ${
          isLocked ? "scale-110 text-emerald-400" : "scale-100 text-white/40"
        }`}
      >
        {/* Vertical Line */}
        <div className="absolute h-full w-[1px] bg-current" />
        {/* Horizontal Line */}
        <div className="absolute h-[1px] w-full bg-current" />
        {/* Center Target Dot */}
        <div className="absolute h-1.5 w-1.5 rounded-full bg-current" />
      </div>
    </div>
  )
}

export default function App() {
  const earthRef = useRef<THREE.Mesh>(null)
  const [entryCoordinates, setEntryCoordinates] =
    useState<EntryCoordinates | null>(null)
  const [rotationPaused, setRotationPaused] = useState(false)
  const isLocked = entryCoordinates?.maxZoomReached ?? false

  function handleToggleRotation() {
    setRotationPaused((paused) => !paused)
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <CoordinateOverlay
        coordinates={entryCoordinates}
        rotationPaused={rotationPaused}
        onToggleRotation={handleToggleRotation}
      />
      <Crosshair isLocked={isLocked} />
      <Canvas
        camera={{ position: [3, 1.5, 5], fov: 45 }}
        gl={{ logarithmicDepthBuffer: true }}
        className="h-full w-full"
      >
        <Sun />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <Suspense fallback={null}>
          <Earth earthRef={earthRef} rotationPaused={rotationPaused} />
          <Moon />
        </Suspense>

        <AtmosphericEntryTracker
          earthRef={earthRef}
          minDistance={ORBIT_MIN_DISTANCE}
          setEntryCoordinates={setEntryCoordinates}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={ORBIT_MIN_DISTANCE}
          maxDistance={30}
        />
      </Canvas>
    </main>
  )
}
