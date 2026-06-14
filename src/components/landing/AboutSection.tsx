import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useTranslation } from "react-i18next"

gsap.registerPlugin(ScrollTrigger)

export function AboutSection() {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const accentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play none none reverse",
        },
      })

      timeline
        .fromTo(
          accentRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: "left center",
            duration: 0.6,
            ease: "power3.out",
          }
        )
        .fromTo(
          headingRef.current,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .fromTo(
          ".about-body-item",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
          },
          "-=0.4"
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="grain-overlay scanline-effect relative min-h-screen bg-stratum-black px-6 py-32 transition-all duration-500 ease-in-out md:px-16 lg:px-24"
    >
      {/* Geometric accent */}
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-stratum-emerald/20 to-transparent" />

      <div className="mx-auto max-w-5xl">
        {/* Section Label */}
        <div ref={accentRef} className="mb-8 flex items-center gap-4">
          <div className="h-px w-12 bg-stratum-emerald" />
          <span className="font-heading text-[11px] font-bold tracking-[0.3em] text-stratum-emerald uppercase">
            {t("about.label")}
          </span>
        </div>

        <h2
          ref={headingRef}
          className="font-heading text-4xl leading-tight font-bold tracking-tight text-stratum-text md:text-5xl lg:text-6xl"
        >
          {t("about.heading1")}
          <br />
          <span className="text-stratum-emerald">{t("about.heading2")}</span>
        </h2>

        <div ref={bodyRef} className="mt-16 grid gap-12 md:grid-cols-2">
          <div className="about-body-item space-y-6">
            <p className="text-base leading-relaxed text-stratum-text-dim md:text-lg">
              {t("about.p1")}
            </p>
            <p className="text-base leading-relaxed text-stratum-text-dim md:text-lg">
              {t("about.p2")}
            </p>
          </div>

          <div className="about-body-item space-y-8">
            {/* Stat cards */}
            <div className="tech-card rounded-lg bg-stratum-surface/50 p-6 backdrop-blur-sm">
              <div className="font-heading text-3xl font-bold text-stratum-emerald">
                128
              </div>
              <div className="mt-1 text-sm text-stratum-text-dim">
                {t("about.stat1Desc")}
              </div>
            </div>
            <div className="tech-card rounded-lg bg-stratum-surface/50 p-6 backdrop-blur-sm">
              <div className="font-heading text-3xl font-bold text-stratum-amber">
                60fps
              </div>
              <div className="mt-1 text-sm text-stratum-text-dim">
                {t("about.stat2Desc")}
              </div>
            </div>
            <div className="tech-card rounded-lg bg-stratum-surface/50 p-6 backdrop-blur-sm">
              <div className="font-heading text-3xl font-bold text-stratum-text">
                3.5s
              </div>
              <div className="mt-1 text-sm text-stratum-text-dim">
                {t("about.stat3Desc")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
