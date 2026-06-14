import { useState, type ChangeEvent } from "react"
import { MapPin, Pause, Play, ZoomIn, ZoomOut, Navigation } from "lucide-react"
import type { EntryCoordinates } from "../AtmosphericEntryTracker"
import type { DescentState } from "../../types/descent"
import { useReverseGeocode } from "../../hooks/useReverseGeocode"

type MobileHudProps = {
  coordinates: EntryCoordinates | null
  descentState: DescentState
  rotationPaused: boolean
  cameraDistance: number
  minDistance: number
  maxDistance: number
  onInitiateDescent: (
    coords: { latitude: number; longitude: number },
    location: string
  ) => void
  onToggleRotation: () => void
  onZoomChange: (distance: number) => void
}

export function MobileHud({
  coordinates,
  descentState,
  rotationPaused,
  cameraDistance,
  minDistance,
  maxDistance,
  onInitiateDescent,
  onToggleRotation,
  onZoomChange,
}: MobileHudProps) {
  const [isPillExpanded, setIsPillExpanded] = useState(false)

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
  const locationLabel = isScanning ? "Scanning..." : reverseGeocode.location
  const descentTarget = reverseGeocode.location ?? "Unknown Sector"
  const descentDisabled =
    isScanning || !hasCoordinates || descentState !== "idle"

  const zoomPercent = Math.round(
    ((maxDistance - cameraDistance) / (maxDistance - minDistance)) * 100
  )

  function handleInitiateDescent() {
    if (!hasCoordinates) return
    onInitiateDescent(
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
      descentTarget
    )
  }

  function handleZoomChange(e: ChangeEvent<HTMLInputElement>) {
    onZoomChange(Number(e.target.value))
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* ── Top: Coordinate Pill ── */}
      <div
        data-tutorial="coordinates"
        className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2"
      >
        <button
          type="button"
          onClick={() => setIsPillExpanded((v) => !v)}
          className={`flex items-center gap-2 rounded-full border bg-black/60 px-4 py-2.5 font-mono text-[11px] shadow-lg backdrop-blur-md transition-all duration-300 ${
            isLocked
              ? "border-emerald-400/25 text-white"
              : "border-white/12 text-white/75"
          }`}
        >
          <MapPin
            className={`h-3.5 w-3.5 shrink-0 transition-colors ${
              isLocked ? "text-emerald-400" : "text-white/30"
            }`}
          />
          {hasCoordinates ? (
            <span className="tabular-nums">
              {coordinates.latitude.toFixed(4)}°,{" "}
              {coordinates.longitude.toFixed(4)}°
            </span>
          ) : (
            <span className="text-white/30">Awaiting lock</span>
          )}
          {isLocked && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          )}
        </button>

        {/* Expanded location tooltip */}
        <div
          className={`mx-auto mt-2 overflow-hidden rounded-lg border bg-black/70 text-center font-mono text-xs shadow-lg backdrop-blur-md transition-all duration-300 ${
            isPillExpanded && isLocked
              ? "max-h-20 border-white/10 px-4 py-2 opacity-100"
              : "max-h-0 border-transparent px-4 py-0 opacity-0"
          }`}
        >
          <div className="text-[9px] tracking-[0.15em] text-white/30 uppercase">
            Resolved Location
          </div>
          <div className="mt-0.5 whitespace-nowrap text-white/85">
            {locationLabel}
          </div>
        </div>
      </div>

      {/* ── Left: Vertical Zoom Rail ── */}
      <div
        data-tutorial="zoom"
        className="pointer-events-auto absolute left-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2"
      >
        <ZoomIn className="h-3 w-3 text-white/35" />
        <div className="flex items-center justify-center rounded-full border border-white/10 bg-black/40 px-2.5 py-3 backdrop-blur-md">
          <input
            type="range"
            className="zoom-slider-vertical"
            min={minDistance}
            max={maxDistance}
            step={0.1}
            value={cameraDistance}
            onChange={handleZoomChange}
          />
        </div>
        <ZoomOut className="h-3 w-3 text-white/35" />
        <span className="font-mono text-[9px] text-stratum-emerald/55 tabular-nums">
          {zoomPercent}%
        </span>
      </div>

      {/* ── Right: Action Buttons ── */}
      <div className="pointer-events-auto absolute right-3 top-[45%] flex -translate-y-1/2 flex-col gap-3">
        <button
          type="button"
          onClick={onToggleRotation}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/50 text-white/65 shadow-lg backdrop-blur-md transition-all active:scale-90"
          aria-label={rotationPaused ? "Resume rotation" : "Pause rotation"}
        >
          {rotationPaused ? (
            <Play className="h-4 w-4 translate-x-[1px]" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* ── Bottom: Descent CTA (only when locked) ── */}
      {isLocked && (
        <div className="pointer-events-auto absolute bottom-8 left-4 right-4 mobile-slide-up">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-full border border-emerald-400/25 bg-emerald-500/12 px-5 py-3.5 font-mono text-[11px] font-semibold tracking-[0.12em] text-emerald-200 uppercase shadow-[0_0_25px_rgba(52,211,153,0.1)] backdrop-blur-md transition-all active:scale-[0.97] disabled:border-white/8 disabled:bg-white/5 disabled:text-white/25 disabled:shadow-none"
            disabled={descentDisabled}
            onClick={handleInitiateDescent}
          >
            <Navigation className="h-4 w-4" />
            {descentState === "idle" ? "Initiate Descent" : "Descent Active"}
          </button>
          {!isScanning && locationLabel && (
            <div className="mt-1.5 text-center font-mono text-[9px] tracking-wider text-white/30">
              → {locationLabel}
            </div>
          )}
        </div>
      )}

      {/* ── Zoom Hint (when not locked) ── */}
      {!isLocked && (
        <div className="pointer-events-none absolute bottom-20 left-0 right-0 text-center">
          <span className="inline-block rounded-full border border-stratum-amber/12 bg-black/35 px-3 py-1.5 font-mono text-[9px] tracking-wider text-stratum-amber/50 backdrop-blur-sm">
            Zoom to max to lock coordinates
          </span>
        </div>
      )}
    </div>
  )
}
