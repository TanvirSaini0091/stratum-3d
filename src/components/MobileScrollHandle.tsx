import { useRef } from "react"
import { ChevronsDown } from "lucide-react"
import { useTranslation } from "react-i18next"

export function MobileScrollHandle({ isLocked }: { isLocked: boolean }) {
  const { t } = useTranslation()
  const startY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diffY = startY.current - currentY

    // Trigger scroll if pulled upwards
    if (diffY > 45) {
      window.scrollTo({
        top: window.innerHeight,
        behavior: "smooth",
      })
    }
  }

  // If locked, jump up above the CTA. If unlocked, sit near the bottom of the screen.
  const bottomPosition = isLocked
    ? "bottom-[calc(120px+env(safe-area-inset-bottom))]"
    : "bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"

  return (
    <div
      className={`pointer-events-auto absolute ${bottomPosition} left-1/2 z-30 -translate-x-1/2 touch-none p-4 transition-all duration-500`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="attention-wiggle flex flex-col items-center justify-center gap-1 opacity-75 transition-opacity active:opacity-100">
        <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-white-400 uppercase">
          {t("scroll.scrollMobile")}
        </span>
        <ChevronsDown className="h-4.5 w-4.5 text-white-500" />
      </div>
    </div>
  )
}