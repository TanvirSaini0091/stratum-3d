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
      className="bg-neutral-950 p-8 font-sans text-neutral-200"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section Label */}
        <div ref={accentRef} className="mb-4 flex items-center gap-4">
          <div className="h-px w-8 bg-neutral-600" />
          <span className="text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
            {t("about.label")}
          </span>
        </div>

        <h2
          ref={headingRef}
          className="mb-10 text-4xl font-extrabold tracking-tight text-white md:text-5xl"
        >
          {t("about.heading1")}
          <br />
          <span className="text-neutral-500">{t("about.heading2")}</span>
        </h2>

        <div ref={bodyRef} className="grid gap-10 md:grid-cols-2">
          <div className="about-body-item flex flex-col gap-6">
            <p className="leading-relaxed text-neutral-400 md:text-lg">
              {t("about.p1")}
            </p>
            <p className="leading-relaxed text-neutral-400 md:text-lg">
              {t("about.p2")}
            </p>
          </div>

          <div className="about-body-item flex flex-col gap-4">
            {/* Stat cards */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
              <div className="text-2xl font-bold text-white">
                GLSL
              </div>
              <div className="mt-1 text-sm text-neutral-400">
                {t("about.stat1Desc")}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
              <div className="text-2xl font-bold text-white">
                60fps
              </div>
              <div className="mt-1 text-sm text-neutral-400">
                {t("about.stat2Desc")}
              </div>
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
              <div className="text-2xl font-bold text-white">
                5,000
              </div>
              <div className="mt-1 text-sm text-neutral-400">
                {t("about.stat3Desc")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}