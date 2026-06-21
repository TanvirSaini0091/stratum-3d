import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useTranslation } from "react-i18next"

gsap.registerPlugin(ScrollTrigger)

type RoadmapItemKey = {
  key: string
  status: "complete" | "in-progress" | "planned" | "postponed"
}

const ROADMAP_KEYS: RoadmapItemKey[] = [
  { key: "PhaseI", status: "complete" },
  { key: "PhaseII", status: "complete" },
  { key: "PhaseIII", status: "complete" },
  { key: "PhaseIV", status: "planned" },
]

const STATUS_STYLES = {
  complete: {
    dot: "bg-emerald-500",
    badge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  "in-progress": {
    dot: "bg-amber-500",
    badge: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  },
  planned: {
    dot: "bg-neutral-500",
    badge: "border-neutral-700 text-neutral-400 bg-neutral-800/50",
  },
  postponed: {
    dot: "bg-red-500",
    badge: "border-red-500/30 text-red-400 bg-red-500/10",
  },
}

export function FutureSection() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".future-heading",
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
        }
      )

      if (itemsRef.current) {
        gsap.fromTo(
          ".roadmap-item",
          { x: -40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: itemsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out",
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="roadmap"
      className="bg-neutral-950 p-8 font-sans text-neutral-200"
    >
      <div className="mx-auto max-w-5xl">
        <div className="future-heading mb-10">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px w-8 bg-neutral-600" />
            <span className="text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
              {t("future.label")}
            </span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {t("future.heading1")}
            <br />
            <span className="text-neutral-500">{t("future.heading2")}</span>
          </h2>
        </div>

        <div ref={itemsRef} className="flex flex-col gap-4">
          {ROADMAP_KEYS.map((item) => {
            const style = STATUS_STYLES[item.status]

            return (
              <div
                key={item.key}
                className="roadmap-item flex gap-6 rounded-lg border border-neutral-800 bg-transparent p-5"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`h-3 w-2.5 rounded-full ${style.dot}`} />
                  <div className="mt-2 h-full w-px bg-neutral-800" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
                      {t(`future.items.${item.key}.phase`)}
                    </span>
                    <span
                      className={`rounded-full border px-1 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${style.badge}`}
                    >
                      {t(`future.status.${item.status}`)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {t(`future.items.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {t(`future.items.${item.key}.description`)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}