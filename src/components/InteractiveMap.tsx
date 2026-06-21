import { useCallback, useState, useRef } from "react"
import Map, { type ViewStateChangeEvent } from "react-map-gl/maplibre"
import type { MapRef } from "react-map-gl/maplibre"
import { ChevronUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import "maplibre-gl/dist/maplibre-gl.css"

type InteractiveMapProps = {
  coordinates: { latitude: number; longitude: number }
  onReturnToOrbit: () => void
}

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY
const MAPTILER_BASIC_STYLE = `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`
const MAPTILER_TERRAIN_URL = `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`

export function InteractiveMap({
  coordinates,
  onReturnToOrbit,
}: InteractiveMapProps) {
  const { t } = useTranslation()
  const mapRef = useRef<MapRef>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [viewState, setViewState] = useState({
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    zoom: 13,
    pitch: 65,
    bearing: 0,
  })

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState)
  }, [])

  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()

    // 1. Add Terrain for 3D mountains
    map.addSource("maptiler-terrain", {
      type: "raster-dem",
      url: MAPTILER_TERRAIN_URL,
    })

    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers
    let labelLayerId
    if (layers) {
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        // Use the 'in' operator to safely check for layout properties
        if (
          layer.type === "symbol" &&
          layer.layout &&
          "text-field" in layer.layout
        ) {
          labelLayerId = layer.id
          break
        }
      }
    }

    // Add Vector source for 3D Buildings from openfreemap
    map.addSource("openfreemap", {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    })

    // Add the 3D Building extrusion layer exactly as in the official example
    map.addLayer(
      {
        id: "3d-buildings",
        source: "openfreemap",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 15,
        filter: ["!=", ["get", "hide_3d"], true],
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0,
            "lightgray",
            200,
            "royalblue",
            400,
            "lightblue",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["get", "render_height"],
          ],
          "fill-extrusion-base": [
            "case",
            [">=", ["get", "zoom"], 16],
            ["get", "render_min_height"],
            0,
          ],
        },
      },
      labelLayerId
    )

    // Give the heavy 3D tiles 2.5 full seconds to download
    // and paint to the canvas in the background before we lift the black curtain.
    setTimeout(() => {
      setIsMapLoaded(true)
    }, 2500)
  }, [])

  return (
    <div className="relative h-screen w-screen bg-neutral-950">
      {/* Ascent HUD - Smoothly fades in only AFTER the map is visible */}
      <div
        className="pointer-events-none absolute top-4 left-4 z-[100]"
        style={{
          opacity: isMapLoaded ? 1 : 0,
          pointerEvents: isMapLoaded ? "auto" : "none",
          transition: "opacity 1.5s ease-in-out",
        }}
      >
        <button
          type="button"
          onClick={onReturnToOrbit}
          className="group flex cursor-pointer items-center gap-2 rounded-md border border-neutral-800 bg-neutral-950/90 px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.12em] text-white uppercase shadow-xl backdrop-blur-md transition-all hover:border-neutral-600 hover:bg-neutral-900 hover:shadow-2xl"
        >
          <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          {t("map.returnToOrbit")}
        </button>
      </div>

      {/* Cinematic Loading HUD - Uses inline styles to guarantee a silky 1.5s fade out */}
      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white"
        style={{
          opacity: isMapLoaded ? 0 : 1,
          visibility: isMapLoaded ? "hidden" : "visible",
          transition: "opacity 1.5s ease-in-out, visibility 1.5s ease-in-out",
        }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-neutral-800 border-t-white" />
          <div className="h-1.5 w-1.5 rounded-full bg-white" />
        </div>
        <div className="mt-6 animate-pulse font-mono text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
          {t("map.calibratingTopography")}
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-widest text-neutral-500">
          {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
        </div>
      </div>

      {/* The Map Engine - Always mounted, loading secretly behind the curtain */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        mapStyle={MAPTILER_BASIC_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        onLoad={handleMapLoad}
        maxPitch={85}
        minZoom={11}
      />
    </div>
  )
}