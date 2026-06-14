import { useCallback, useEffect, useState } from "react"
import { ChevronRight, X, HelpCircle, Rocket } from "lucide-react"
import { useTranslation } from "react-i18next"

const STORAGE_KEY = "stratum-onboarding-v1"

const STEPS_KEYS = [
  { key: "welcome", targetSelector: undefined },
  { key: "nav", targetSelector: undefined },
  { key: "zoom", targetSelector: "[data-tutorial='zoom']" },
  { key: "coords", targetSelector: "[data-tutorial='coordinates']" },
  { key: "surface", targetSelector: undefined },
  { key: "explore", targetSelector: "[data-tutorial='scroll']" },
  { key: "complete", targetSelector: undefined },
]

type OnboardingTutorialProps = {
  isActive: boolean
  isMobile: boolean
  onComplete: () => void
}

export function OnboardingTutorial({
  isActive,
  isMobile,
  onComplete,
}: OnboardingTutorialProps) {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)

  // Fade in when activated
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
    } else {
      setIsVisible(false)
    }
  }, [isActive])

  // Update spotlight when step changes
  useEffect(() => {
    if (!isActive) return
    const step = STEPS_KEYS[currentStep]
    if (step.targetSelector) {
      const el = document.querySelector(step.targetSelector)
      if (el) {
        setSpotlightRect(el.getBoundingClientRect())
        return
      }
    }
    setSpotlightRect(null)
  }, [currentStep, isActive])

  // Recalculate spotlight on resize / scroll
  useEffect(() => {
    if (!isActive) return
    function update() {
      const step = STEPS_KEYS[currentStep]
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector)
        if (el) setSpotlightRect(el.getBoundingClientRect())
      }
    }
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update)
    }
  }, [isActive, currentStep])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(onComplete, 500)
  }, [onComplete])

  const handleNext = useCallback(() => {
    if (currentStep < STEPS_KEYS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleDismiss()
    }
  }, [currentStep, handleDismiss])

  if (!isActive) return null

  const step = STEPS_KEYS[currentStep]
  const title = t(`tutorial.${step.key}Title`)
  let description = t(`tutorial.${step.key}Desc`)
  if (isMobile && step.key === "nav") {
    description = t("tutorial.navMobileDesc")
  }
  const isFirst = currentStep === 0
  const isLast = currentStep === STEPS_KEYS.length - 1

  // Position the instruction card relative to the spotlight
  let cardStyle: React.CSSProperties
  if (spotlightRect) {
    if (isMobile) {
      // On mobile, space is tight. Anchor the card to the opposite half of the screen.
      const spotlightCenterY = spotlightRect.top + spotlightRect.height / 2
      if (spotlightCenterY < window.innerHeight / 2) {
        cardStyle = {
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
        }
      } else {
        cardStyle = { top: "24px", left: "50%", transform: "translateX(-50%)" }
      }
    } else {
      // Desktop positioning logic
      const spaceBelow = window.innerHeight - spotlightRect.bottom
      if (spaceBelow > 260) {
        cardStyle = {
          top: spotlightRect.bottom + 20,
          left: "50%",
          transform: "translateX(-50%)",
        }
      } else {
        cardStyle = {
          bottom: window.innerHeight - spotlightRect.top + 20,
          left: "50%",
          transform: "translateX(-50%)",
        }
      }
    }
  } else {
    // Default positioning when no spotlight is active
    cardStyle = isMobile
      ? { bottom: "24px", left: "50%", transform: "translateX(-50%)" }
      : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
  }

  return (
    <div
      className={`fixed inset-0 z-[9998] transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {/* Backdrop with optional spotlight cutout */}
      {spotlightRect ? (
        <div
          className="absolute rounded-xl transition-all duration-500 ease-out"
          style={{
            top: spotlightRect.top - 10,
            left: spotlightRect.left - 10,
            width: spotlightRect.width + 20,
            height: spotlightRect.height + 20,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.85)",
            border: "1px solid rgba(52, 211, 153, 0.15)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/85" />
      )}

      {/* Instruction Card */}
      <div
        className="absolute w-[min(22rem,calc(100vw-2.5rem))]"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {/* Decorative top accent */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-stratum-emerald/40 to-transparent" />

          <div className="p-5">
            {/* Step badge */}
            <div className="mb-3 flex items-center gap-2.5">
              {isFirst ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stratum-emerald/15">
                  <Rocket className="h-3.5 w-3.5 text-stratum-emerald" />
                </div>
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-stratum-emerald/15 font-mono text-[11px] font-bold text-stratum-emerald">
                  {currentStep}
                </div>
              )}
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/25 uppercase">
                {isFirst
                  ? t("tutorial.welcomeTitle")
                  : isLast
                    ? t("tutorial.ready")
                    : t("tutorial.step", { current: currentStep, total: STEPS_KEYS.length - 2 })}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-heading text-base font-bold tracking-tight text-white">
              {title}
            </h3>

            {/* Description — key forces remount for CSS animation */}
            <p
              key={currentStep}
              className="tutorial-text-enter mt-2 text-[13px] leading-relaxed text-white/50"
            >
              {description}
            </p>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] text-white/20 uppercase transition-colors hover:text-white/50"
              >
                <X className="h-3 w-3" />
                {t("tutorial.skip")}
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded-full border border-stratum-emerald/25 bg-stratum-emerald/10 px-4 py-2 font-mono text-[11px] font-semibold tracking-[0.08em] text-stratum-emerald uppercase transition-all hover:bg-stratum-emerald/20 active:scale-95"
              >
                {isFirst ? t("tutorial.begin") : isLast ? t("tutorial.launch") : t("tutorial.next")}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Step indicator dots */}
            <div className="mt-4 flex justify-center gap-1.5">
              {STEPS_KEYS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? "w-4 bg-stratum-emerald"
                      : i < currentStep
                        ? "w-1.5 bg-stratum-emerald/30"
                        : "w-1.5 bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Floating "?" button to re-open the tutorial at any time. */
export function TutorialHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/25 backdrop-blur-md transition-all hover:border-white/20 hover:text-white/55 active:scale-90"
      aria-label="Show tutorial"
    >
      <HelpCircle className="h-4 w-4" />
    </button>
  )
}

/** Check if the user has completed the onboarding tutorial before. */
export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true"
}

/** Mark the onboarding tutorial as complete. */
export function markOnboardingComplete(): void {
  localStorage.setItem(STORAGE_KEY, "true")
}
