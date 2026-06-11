import { useEffect, useMemo, useState } from "react"

type NominatimAddress = {
  city?: string
  town?: string
  village?: string
  hamlet?: string
  municipality?: string
  county?: string
  state?: string
  country?: string
  ocean?: string
  sea?: string
  bay?: string
  strait?: string
}

type NominatimReverseResponse = {
  display_name?: string
  name?: string
  error?: string
  address?: NominatimAddress
}

type ReverseGeocodeStatus = "idle" | "scanning" | "resolved" | "error"

type ReverseGeocodeResult = {
  location: string | null
  status: ReverseGeocodeStatus
  isLoading: boolean
}

const DEBOUNCE_MS = 450
const MIN_REQUEST_INTERVAL_MS = 1100
const COORDINATE_PRECISION = 3
const locationCache = new Map<string, string>()
let lastRequestStartedAt = 0

function getReadableLocation(data: NominatimReverseResponse): string {
  if (data.error) return "Open Ocean"

  const address = data.address
  if (!address) return data.name ?? data.display_name ?? "Unknown Sector"

  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.municipality
  const waterBody =
    address.ocean ?? address.sea ?? address.bay ?? address.strait

  if (locality && address.country) return `${locality}, ${address.country}`
  if (locality) return locality
  if (waterBody) return waterBody
  if (address.state && address.country)
    return `${address.state}, ${address.country}`
  if (address.country) return address.country

  return data.name ?? data.display_name ?? "Unknown Sector"
}

export function useReverseGeocode(
  latitude: number | undefined,
  longitude: number | undefined,
  isLocked: boolean
): ReverseGeocodeResult {
  const [result, setResult] = useState<ReverseGeocodeResult>({
    location: null,
    status: "idle",
    isLoading: false,
  })

  const roundedLatitude =
    latitude !== undefined && Number.isFinite(latitude)
      ? Number(latitude.toFixed(COORDINATE_PRECISION))
      : null
  const roundedLongitude =
    longitude !== undefined && Number.isFinite(longitude)
      ? Number(longitude.toFixed(COORDINATE_PRECISION))
      : null

  const query = useMemo(() => {
    if (!isLocked || roundedLatitude === null || roundedLongitude === null) {
      return null
    }

    /*
     * Nominatim does not need sub-meter precision at zoom 10. Rounding keeps
     * small camera/raycast jitter from producing redundant reverse-geocode calls.
     */
    return {
      latitude: roundedLatitude,
      longitude: roundedLongitude,
      cacheKey: `${roundedLatitude},${roundedLongitude}`,
    }
  }, [isLocked, roundedLatitude, roundedLongitude])

  useEffect(() => {
    if (!query) {
      setResult({ location: null, status: "idle", isLoading: false })
      return
    }

    const cachedLocation = locationCache.get(query.cacheKey)
    if (cachedLocation) {
      setResult({
        location: cachedLocation,
        status: "resolved",
        isLoading: false,
      })
      return
    }

    let controller: AbortController | null = null

    setResult((previous) => ({
      location: previous.location,
      status: "scanning",
      isLoading: true,
    }))

    const elapsedSinceLastRequest = Date.now() - lastRequestStartedAt
    const requestDelay = Math.max(
      DEBOUNCE_MS,
      MIN_REQUEST_INTERVAL_MS - elapsedSinceLastRequest
    )

    const timeoutId = window.setTimeout(async () => {
      controller = new AbortController()
      lastRequestStartedAt = Date.now()

      try {
        const params = new URLSearchParams({
          lat: String(query.latitude),
          lon: String(query.longitude),
          format: "json",
          zoom: "10",
        })

        const response = await fetch(
          `/api/nominatim/reverse?${params.toString()}`,
          {
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error(`Nominatim returned ${response.status}`)
        }

        const data = (await response.json()) as NominatimReverseResponse
        const location = getReadableLocation(data)
        locationCache.set(query.cacheKey, location)

        setResult({ location, status: "resolved", isLoading: false })
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        setResult({
          location: "Unknown Sector",
          status: "error",
          isLoading: false,
        })
      }
    }, requestDelay)

    return () => {
      window.clearTimeout(timeoutId)
      controller?.abort()
    }
  }, [query])

  return result
}
