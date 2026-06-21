import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useTranslation } from "react-i18next"

gsap.registerPlugin(ScrollTrigger)

type TechItemKey = {
  name: string
  key: string
}

const TECHNOLOGIES_KEYS: TechItemKey[] = [
  { name: "Three.js", key: "ThreeJs" },
  { name: "React Three Fiber", key: "ReactThreeFiber" },
  { name: "MapLibre GL", key: "MapLibreGL" },
  { name: "GSAP", key: "GSAP" },
  { name: "Vite", key: "Vite" },
  { name: "TypeScript", key: "TypeScript" },
]

export function TechSection() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tech-section-heading",
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

      if (cardsRef.current) {
        gsap.fromTo(
          ".tech-card",
          { y: 60, opacity: 0 },
          {
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
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
      id="technologies"
      className="bg-neutral-950 p-8 font-sans text-neutral-200"
    >
      <div className="mx-auto max-w-5xl">
        <div className="tech-section-heading mb-10">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px w-8 bg-neutral-600" />
            <span className="text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
              {t("tech.label")}
            </span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {t("tech.heading1")}
            <br />
            <span className="text-neutral-500">{t("tech.heading2")}</span>
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TECHNOLOGIES_KEYS.map((tech) => (
            <div
              key={tech.name}
              className="tech-card rounded-lg border border-neutral-800 bg-transparent p-5"
            >
              <div className="mb-1 text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
                {t(`tech.items.${tech.key}.category`)}
              </div>
              <div className="text-xl font-bold text-white">
                {tech.name}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {t(`tech.items.${tech.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}