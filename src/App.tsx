import { Suspense, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Html, useProgress } from "@react-three/drei"
import { Pause, Play } from "lucide-react"
import * as THREE from "three"
import { DescentCameraAnimator } from "./components/DescentCameraAnimator"
import { AtmosphericSpeedLines } from "./components/AtmosphericSpeedLines"
import { Earth } from "./components/Earth"
import { Moon } from "./components/Moon"
import { Sun } from "./components/Sun"
import { InteractiveMap } from "./components/InteractiveMap"
import {
  AtmosphericEntryTracker,
  type EntryCoordinates,
} from "./components/AtmosphericEntryTracker"
import { useReverseGeocode } from "./hooks/useReverseGeocode"
import type { DescentState } from "./types/descent"

const ORBIT_MIN_DISTANCE = 3.5

type LandedCoordinates = {
  latitude: number
  longitude: number
}

function CoordinateOverlay({
  coordinates,
  descentState,
  rotationPaused,
  onInitiateDescent,
  onToggleRotation,
}: {
  coordinates: EntryCoordinates | null
  descentState: DescentState
  rotationPaused: boolean
  onInitiateDescent: (coordinates: LandedCoordinates, location: string) => void
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
  const descentDisabled =
    isScanning || !hasCoordinates || descentState !== "idle"

  function handleInitiateDescent() {
    if (!hasCoordinates) return

    onInitiateDescent(
      {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      descentTarget
    )
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
            disabled={descentDisabled}
            onClick={handleInitiateDescent}
          >
            {descentState === "idle"
              ? `Initiate Descent To ${descentTarget}`
              : "Descent Sequence Active"}
          </button>
        </div>
      )}
    </div>
  )
}

function Crosshair({ isLocked }: { isLocked: boolean }) {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <div
        className={`relative flex h-8 w-8 items-center justify-center transition-colors duration-300 ${
          isLocked ? "scale-110 text-emerald-400" : "scale-100 text-white/40"
        }`}
      >
        <div className="absolute h-full w-[1px] bg-current" />
        <div className="absolute h-[1px] w-full bg-current" />
        <div className="absolute h-1.5 w-1.5 rounded-full bg-current" />
      </div>
    </div>
  )
}

function SceneLoader() {
  const { progress } = useProgress()
  
  return (
    <Html center>
      <div className="pointer-events-none flex flex-col items-center justify-center w-64">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="mt-6 animate-pulse font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80 text-center">
          Establishing Uplink... {progress.toFixed(0)}%
        </div>
      </div>
    </Html>
  )
}

export default function App() {
  const earthRef = useRef<THREE.Mesh>(null)

  const [entryCoordinates, setEntryCoordinates] = useState<EntryCoordinates | null>(null)
  const [rotationPaused, setRotationPaused] = useState(false)
  const [descentState, setDescentState] = useState<DescentState>("idle")
  const [landedCoordinates, setLandedCoordinates] = useState<LandedCoordinates | null>(null)
  
  // Controls the pure-CSS overlay visibility independently from component mount cycle
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  const isLocked = entryCoordinates?.maxZoomReached ?? false
  const showPlanetaryScene = descentState !== "landed"
  const showHud = descentState === "idle"

  function handleToggleRotation() {
    setRotationPaused((paused) => !paused)
  }

  function handleInitiateDescent(coordinates: LandedCoordinates, location: string) {
    console.log("Descent initiated to: ", location)
    setLandedCoordinates(coordinates)
    setRotationPaused(true)
    setDescentState("diving")
  }

  // --- REFACTORED: Programmatic Descent Transition ---
  function handleDiveComplete() {
    setDescentState("whiteout")
    setIsOverlayVisible(true) // Turn screen fully opaque white

    // Wait 500ms for the CSS fade-to-white transition to completely finish
    setTimeout(() => {
      setDescentState("landed") // Unmount 3D space scene, mount Map canvas
      
      // Let the Map engine initialize, then fade out the white overlay
      setTimeout(() => {
        setIsOverlayVisible(false)
      }, 300)
    }, 500)
  }

  // --- Ascent Logic ---
  function handleReturnToOrbit() {
    console.log("Executing return sequence... Fading to black.")
    setIsReturning(true)

    setTimeout(() => {
      console.log("Swapping engines in the background...")
      setDescentState("idle")
      setEntryCoordinates(null)
      setLandedCoordinates(null)
      setRotationPaused(false) 

      setTimeout(() => {
        console.log("Revealing 3D Space!")
        setIsReturning(false)
      }, 1500) // Give WebGL time to compile shaders and mount before dropping curtain
    }, 700) // Matches CSS transition duration
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      
      {/* --- LAYER 1: The Map Engine --- */}
      {!showPlanetaryScene && landedCoordinates && (
        <InteractiveMap 
          coordinates={landedCoordinates} 
          onReturnToOrbit={handleReturnToOrbit}
        />
      )}

      {/* --- LAYER 2: Pure Code/CSS Transition Overlays --- */}
      <div
        className={`pointer-events-none absolute inset-0 z-[200] flex items-center justify-center transition-all cubic-bezier(0.4, 0, 0.2, 1) ${
          isOverlayVisible || isReturning ? "opacity-100" : "opacity-0"
        } ${isReturning ? "bg-black duration-700" : "bg-white duration-500"}`} 
      >
        {isReturning && (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute h-full w-full animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="mt-6 animate-pulse font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80 text-center">
              Re-establishing Orbital Link...
            </div>
          </div>
        )}
      </div>

      {/* --- LAYER 3: The 3D Space Engine --- */}
      {showPlanetaryScene && (
        <>
          {showHud && (
            <>
              <CoordinateOverlay
                coordinates={entryCoordinates}
                descentState={descentState}
                rotationPaused={rotationPaused}
                onInitiateDescent={handleInitiateDescent}
                onToggleRotation={handleToggleRotation}
              />
              <Crosshair isLocked={isLocked} />
            </>
          )}
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

            <Suspense fallback={<SceneLoader />}>
              <Earth earthRef={earthRef} rotationPaused={rotationPaused} />
              <Moon />
            </Suspense>

            <AtmosphericEntryTracker
              enabled={descentState === "idle"}
              earthRef={earthRef}
              minDistance={ORBIT_MIN_DISTANCE}
              setEntryCoordinates={setEntryCoordinates}
            />

            <DescentCameraAnimator
              descentState={descentState}
              onDiveComplete={handleDiveComplete}
            />

            <AtmosphericSpeedLines descentState={descentState} />

            <OrbitControls
              enabled={descentState === "idle"}
              enableZoom={descentState === "idle"}
              enablePan={false}
              minDistance={ORBIT_MIN_DISTANCE}
              maxDistance={30}
            />
          </Canvas>
        </>
      )}
    </main>
  )
}