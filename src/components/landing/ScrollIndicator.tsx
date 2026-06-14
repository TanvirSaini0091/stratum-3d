import { useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useTranslation } from "react-i18next"

type ScrollIndicatorProps = {
  visible: boolean
}

export function ScrollIndicator({ visible }: ScrollIndicatorProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    containerRef.current.style.opacity = visible ? "1" : "0"
  }, [visible])

  return (
    <div
      ref={containerRef}
      data-tutorial="scroll"
      className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-700"
      style={{ opacity: 0 }}
    >
      <span className="font-heading text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase">
        {t("scroll.scrollToExplore")}
      </span>
      <ChevronDown className="scroll-bounce h-4 w-4 text-stratum-emerald/60" />
    </div>
  )
}
