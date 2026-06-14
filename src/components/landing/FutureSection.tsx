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
    dot: "bg-stratum-emerald",
    badge:
      "border-stratum-emerald/30 text-stratum-emerald bg-stratum-emerald/10",
    label: "Complete",
  },
  "in-progress": {
    dot: "bg-stratum-amber",
    badge: "border-stratum-amber/30 text-stratum-amber bg-stratum-amber/10",
    label: "In Progress",
  },
  planned: {
    dot: "bg-stratum-text-dim",
    badge: "border-stratum-border text-stratum-text-dim bg-stratum-surface/30",
    label: "Planned",
  },
  postponed: {
    dot: "bg-red-500/60",
    badge: "border-red-500/30 text-red-400 bg-red-500/10",
    label: "Postponed",
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
      className="grain-overlay relative min-h-screen bg-stratum-black px-6 py-32 transition-all duration-500 ease-in-out md:px-16 lg:px-24"
    >
      <div className="section-divider absolute top-0 right-0 left-0" />

      <div className="mx-auto max-w-5xl">
        <div className="future-heading mb-16">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-12 bg-stratum-emerald" />
            <span className="font-heading text-[11px] font-bold tracking-[0.3em] text-stratum-emerald uppercase">
              {t("future.label")}
            </span>
          </div>

          <h2 className="font-heading text-4xl leading-tight font-bold tracking-tight text-stratum-text md:text-5xl">
            {t("future.heading1")}
            <br />
            <span className="text-stratum-text-dim">{t("future.heading2")}</span>
          </h2>
        </div>

        <div ref={itemsRef} className="space-y-6">
          {ROADMAP_KEYS.map((item) => {
            const style = STATUS_STYLES[item.status]

            return (
              <div
                key={item.key}
                className="roadmap-item group flex gap-6 rounded-lg border border-stratum-border/30 bg-stratum-surface/20 p-6 transition-all duration-300 hover:border-stratum-border/60 hover:bg-stratum-surface/40"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`h-3 w-3 rounded-full ${style.dot}`} />
                  <div className="mt-2 h-full w-px bg-stratum-border/30" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="font-heading text-[10px] font-bold tracking-[0.2em] text-stratum-text-dim uppercase">
                      {t(`future.items.${item.key}.phase`)}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${style.badge}`}
                    >
                      {t(`future.status.${item.status}`)}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stratum-text">
                    {t(`future.items.${item.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stratum-text-dim">
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
