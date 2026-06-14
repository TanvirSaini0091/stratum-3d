import { useRef } from "react"

export function MobileScrollHandle() {
  const startY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    const diffY = startY.current - currentY

    // If the user drags the pill upwards by more than 45 pixels, trigger the scroll
    if (diffY > 45) {
      window.scrollTo({
        top: window.innerHeight, // Scrolls down exactly one screen height
        behavior: "smooth",
      })
    }
  }

  return (
    <div
      className="pointer-events-auto absolute bottom-4 left-1/2 z-30 -translate-x-1/2 touch-none p-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="attention-wiggle flex h-12 w-36 flex-col items-center justify-center rounded-full border border-white/10 bg-black/60 shadow-[0_0_20px_rgba(52,211,153,0.15)] backdrop-blur-md transition-colors active:bg-black/80">
        <span className="font-mono text-[9px] font-semibold tracking-[0.15em] text-white/50 uppercase">
          Pull to scroll
        </span>
      </div>
    </div>
  )
}