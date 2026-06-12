import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, Html, useProgress } from "@react-three/drei"
import { Pause, Play } from "lucide-react"
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

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

import { ZoomSlider } from "./components/landing/ZoomSlider"
import { ScrollIndicator } from "./components/landing/ScrollIndicator"
import { AboutSection } from "./components/landing/AboutSection"
import { TechSection } from "./components/landing/TechSection"
import { FutureSection } from "./components/landing/FutureSection"
import { Footer } from "./components/landing/Footer"
import { ChevronUp, ChevronDown } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const ORBIT_MIN_DISTANCE = 3.5
const ORBIT_MAX_DISTANCE = 30

type LandedCoordinates = {
  latitude: number
  longitude: number
}

// ─── Zoom Controller ────────────────────────────────────
// Lives inside the R3F Canvas tree so it can read `useThree`.
// Receives the desired camera distance from the HUD slider
// and lerps the camera toward it each frame.

function ZoomController({ targetDistance }: { targetDistance: number }) {
  const { camera } = useThree()
  const targetRef = useRef(targetDistance)

  useEffect(() => {
    targetRef.current = targetDistance
  }, [targetDistance])

  useEffect(() => {
    let frameId: number

    function tick() {
      const current = camera.position.length()
      const target = targetRef.current
      const diff = Math.abs(current - target)

      if (diff > 0.01) {
        const direction = camera.position.clone().normalize()
        const newDist = THREE.MathUtils.lerp(current, target, 0.08)
        camera.position.copy(direction.multiplyScalar(newDist))
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [camera])

  return null
}

// ─── HUD Overlay ────────────────────────────────────────

function CoordinateOverlay({
  coordinates,
  descentState,
  rotationPaused,
  cameraDistance,
  onInitiateDescent,
  onToggleRotation,
  onZoomChange,
}: {
  coordinates: EntryCoordinates | null
  descentState: DescentState
  rotationPaused: boolean
  cameraDistance: number
  onInitiateDescent: (coordinates: LandedCoordinates, location: string) => void
  onToggleRotation: () => void
  onZoomChange: (distance: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)

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
    <div className="pointer-events-auto absolute top-4 left-4 z-10 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-white/15 bg-black/65 font-mono text-xs text-white shadow-xl backdrop-blur-md transition-all duration-300">
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={() => {
          // Only toggle on mobile (Tailwind 'sm' is 640px)
          if (window.innerWidth < 640) setIsExpanded(!isExpanded)
        }}
        className="flex w-full items-center justify-between px-4 py-3 sm:cursor-default"
      >
        <span className="text-[10px] font-semibold tracking-[0.18em] text-white/55 uppercase">
          Atmospheric Entry
        </span>
        <div className="sm:hidden">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-white/55" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/55" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={`overflow-hidden px-4 transition-all duration-300 sm:max-h-[500px] sm:pb-3 sm:opacity-100 ${isExpanded ? "max-h-[500px] pb-3 opacity-100" : "max-h-0 opacity-0"}`}
      >
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

        {/* Zoom Slider — replaces scroll-to-zoom in orbit view */}
        <ZoomSlider
          value={cameraDistance}
          min={ORBIT_MIN_DISTANCE}
          max={ORBIT_MAX_DISTANCE}
          onChange={onZoomChange}
        />

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

function GlobalLoader() {
  const { progress, active, total } = useProgress()
  const [show, setShow] = useState(true)
  const [earthRendered, setEarthRendered] = useState(false)

  useEffect(() => {
    const handleEarthRendered = () => {
      setEarthRendered(true)
    }
    window.addEventListener("stratum-earth-rendered", handleEarthRendered)
    return () =>
      window.removeEventListener("stratum-earth-rendered", handleEarthRendered)
  }, [])

  useEffect(() => {
    // Wait until the Earth component has explicitly fired its first frame
    // This perfectly captures the time spent on shader compilation and GPU upload!
    if (earthRendered) {
      const timer = setTimeout(() => setShow(false), 600)
      return () => clearTimeout(timer)
    }
  }, [earthRendered])

  if (!show) return null

  // Determine the display text based on the exact phase of loading
  let statusText = "Establishing Link..."
  let percentageText = `${total > 0 ? Math.round(progress) : 0}%`

  if (earthRendered) {
    statusText = "Link Established"
    percentageText = "100%"
  } else if (progress === 100 && total > 0) {
    statusText = "Compiling Shaders..."
    percentageText = "99%"
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/10 backdrop-blur-2xl transition-opacity duration-700 ${
        earthRendered ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-full w-full animate-spin rounded-full border-2 border-stratum-emerald/20 border-t-stratum-emerald" />
        <div className="h-2 w-2 rounded-full bg-stratum-emerald shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
      </div>
      <div className="mt-8 animate-pulse font-heading text-[11px] font-bold tracking-[0.4em] text-stratum-emerald uppercase">
        {statusText} {percentageText}
      </div>
    </div>
  )
}

// ─── Hero Title Overlay ─────────────────────────────────
// Floating title displayed on the hero section, positioned
// opposite to the HUD so it doesn't overlap.

function HeroTitle() {
  return (
    <div className="pointer-events-none absolute right-6 bottom-24 z-10 text-right md:right-12">
      <h1 className="font-heading text-4xl leading-none font-bold tracking-tight text-white/90 md:text-6xl lg:text-7xl">
        Stratum
        <span className="text-stratum-emerald">3D</span>
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/40 md:max-w-sm md:text-base">
        Explore Earth from orbit. Zoom in, lock coordinates, and descend through
        the atmosphere.
      </p>
    </div>
  )
}

// ─── Main App ───────────────────────────────────────────

export default function App() {
  const earthRef = useRef<THREE.Mesh>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [entryCoordinates, setEntryCoordinates] =
    useState<EntryCoordinates | null>(null)
  const [rotationPaused, setRotationPaused] = useState(false)
  const [descentState, setDescentState] = useState<DescentState>("idle")
  const [landedCoordinates, setLandedCoordinates] =
    useState<LandedCoordinates | null>(null)
  const [cameraDistance, setCameraDistance] = useState(8.8) // Default 80% zoom

  // Controls the pure-CSS overlay visibility independently from component mount cycle
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  const isLocked = entryCoordinates?.maxZoomReached ?? false
  const showPlanetaryScene = descentState !== "landed"
  const showHud = descentState === "idle"

  // --- GSAP ScrollTrigger: Pin hero and reveal content sections ---
  useEffect(() => {
    // Only set up scroll pinning when we're in the landing page state (not descended)
    if (!showPlanetaryScene) return

    const ctx = gsap.context(() => {
      // Pin the hero section while the content slides up over it
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        endTrigger: contentRef.current,
        end: "top top",
        pin: true,
        pinSpacing: false,
      })

      // Fade the hero HUD elements as user scrolls down
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 100%",
          end: "top 40%",
          scrub: true,
        },
        opacity: 0.3,
        scale: 0.98,
        ease: "none",
      })
    }, mainRef)

    return () => ctx.revert()
  }, [showPlanetaryScene])

  const handleToggleRotation = useCallback(() => {
    setRotationPaused((paused) => !paused)
  }, [])

  const handleZoomChange = useCallback((distance: number) => {
    setCameraDistance(distance)
  }, [])

  function handleInitiateDescent(
    coordinates: LandedCoordinates,
    location: string
  ) {
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

  // ─── Landed State: Full-screen map, no landing page sections ───
  if (!showPlanetaryScene && landedCoordinates) {
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-black">
        <InteractiveMap
          coordinates={landedCoordinates}
          onReturnToOrbit={handleReturnToOrbit}
        />

        {/* Transition overlay */}
        <div
          className={`cubic-bezier(0.4, 0, 0.2, 1) pointer-events-none absolute inset-0 z-[200] flex items-center justify-center transition-all ${
            isOverlayVisible || isReturning ? "opacity-100" : "opacity-0"
          } ${isReturning ? "bg-black duration-700" : "bg-white duration-500"}`}
        >
          {isReturning && (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <div className="absolute h-full w-full animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <div className="mt-6 animate-pulse text-center font-mono text-xs font-semibold tracking-[0.2em] text-emerald-400/80 uppercase">
                Re-establishing Orbital Link...
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ─── Landing Page State: Hero + Sections ───
  return (
    <div ref={mainRef} className="relative bg-stratum-black">
      <GlobalLoader />

      {/* ── Transition Overlay (always on top) ── */}
      <div
        className={`cubic-bezier(0.4, 0, 0.2, 1) pointer-events-none fixed inset-0 z-[200] flex items-center justify-center transition-all ${
          isOverlayVisible || isReturning ? "opacity-100" : "opacity-0"
        } ${isReturning ? "bg-black duration-700" : "bg-white duration-500"}`}
      >
        {isReturning && (
          <div className="flex flex-col items-center justify-center text-white">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <div className="absolute h-full w-full animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="mt-6 animate-pulse text-center font-mono text-xs font-semibold tracking-[0.2em] text-emerald-400/80 uppercase">
              Re-establishing Orbital Link...
            </div>
          </div>
        )}
      </div>

      {/* ── HERO SECTION: 3D Canvas ── */}
      <div ref={heroRef} className="relative h-screen w-full overflow-hidden">
        {showHud && (
          <>
            <CoordinateOverlay
              coordinates={entryCoordinates}
              descentState={descentState}
              rotationPaused={rotationPaused}
              cameraDistance={cameraDistance}
              onInitiateDescent={handleInitiateDescent}
              onToggleRotation={handleToggleRotation}
              onZoomChange={handleZoomChange}
            />
            <Crosshair isLocked={isLocked} />
            <HeroTitle />
            <ScrollIndicator visible={descentState === "idle"} />
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

          <Suspense fallback={null}>
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

          {/* Zoom is driven by the HUD slider, not by scroll wheel */}
          <ZoomController targetDistance={cameraDistance} />

          <OrbitControls
            enabled={descentState === "idle"}
            enableZoom={false}
            enablePan={false}
            minDistance={ORBIT_MIN_DISTANCE}
            maxDistance={ORBIT_MAX_DISTANCE}
          />
        </Canvas>
      </div>

      {/* ── CONTENT SECTIONS: Slide up over the pinned hero ── */}
      <div ref={contentRef} className="relative z-30">
        <AboutSection />
        <TechSection />
        <FutureSection />
        <Footer />
      </div>
    </div>
  )
}