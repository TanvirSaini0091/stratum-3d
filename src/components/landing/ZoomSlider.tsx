import { type ChangeEvent } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { useTranslation } from "react-i18next"

type ZoomSliderProps = {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

export function ZoomSlider({ value, min, max, onChange }: ZoomSliderProps) {
  const { t } = useTranslation()
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value))
  }

  // Map camera distance to a visual 0-100 percentage
  // Slider is INVERTED: max distance = 0%, min distance = 100%
  const zoomPercent = Math.round(((max - value) / (max - min)) * 100)

  return (
    <div className="pointer-events-auto mt-4 border-t border-neutral-800 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 uppercase">
          {t("zoom.orbitalZoom")}
        </span>
        <span className="font-mono text-[10px] text-neutral-300 tabular-nums">
          {zoomPercent}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ZoomOut className="h-3 w-3 shrink-0 text-neutral-600" />
        <input
          type="range"
          className="w-full cursor-pointer accent-white"
          min={min}
          max={max}
          step={0.1}
          value={value}
          onChange={handleChange}
        />
        <ZoomIn className="h-3 w-3 shrink-0 text-neutral-600" />
      </div>
      {zoomPercent < 100 && (
        <p className="mt-2 text-[9px] leading-relaxed text-neutral-500">
          {t("zoom.zoomHint")}
        </p>
      )}
    </div>
  )
}