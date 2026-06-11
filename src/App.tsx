import { Suspense, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import { Earth } from "./components/Earth"
import { Moon } from "./components/Moon"
import { Sun } from "./components/Sun"
import {
  AtmosphericEntryTracker,
  type EntryCoordinates,
} from "./components/AtmosphericEntryTracker"

const ORBIT_MIN_DISTANCE = 3.5

function CoordinateOverlay({
  coordinates,
}: {
  coordinates: EntryCoordinates | null
}) {
  const hasCoordinates =
    coordinates &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude)

  return (
    <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-md border border-white/15 bg-black/65 px-4 py-3 font-mono text-xs text-white shadow-xl backdrop-blur-md">
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
  const isLocked = entryCoordinates?.maxZoomReached ?? false
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <CoordinateOverlay coordinates={entryCoordinates} />
      <Crosshair isLocked={isLocked} />
      <Canvas
        shadows
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
          <Earth earthRef={earthRef} />
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
