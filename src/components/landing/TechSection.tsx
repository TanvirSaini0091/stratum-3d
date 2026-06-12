import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type TechItem = {
  name: string
  category: string
  description: string
}

const TECHNOLOGIES: TechItem[] = [
  {
    name: "Three.js",
    category: "3D Engine",
    description:
      "WebGL-powered 3D rendering with custom GLSL shaders for night-side illumination and atmospheric effects.",
  },
  {
    name: "React Three Fiber",
    category: "Declarative 3D",
    description:
      "React renderer for Three.js enabling a component-driven architecture for the entire orbital scene.",
  },
  {
    name: "MapLibre GL",
    category: "Cartography",
    description:
      "Open-source vector tile engine with 3D terrain extrusion and building geometry for surface inspection.",
  },
  {
    name: "GSAP",
    category: "Animation",
    description:
      "ScrollTrigger-powered transitions for the landing page. Precise easing curves for cinematic motion.",
  },
  {
    name: "Vite",
    category: "Build Tool",
    description:
      "Lightning-fast HMR and optimized production builds with native ESM support.",
  },
  {
    name: "TypeScript",
    category: "Language",
    description:
      "End-to-end type safety across the 3D scene graph, map engine, and UI layer.",
  },
]

export function TechSection() {
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
      className="grain-overlay relative min-h-screen bg-stratum-void px-6 py-32 transition-all duration-500 ease-in-out md:px-16 lg:px-24"
    >
      <div className="section-divider absolute top-0 right-0 left-0" />

      <div className="mx-auto max-w-5xl">
        <div className="tech-section-heading mb-16">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-12 bg-stratum-amber" />
            <span className="font-heading text-[11px] font-bold tracking-[0.3em] text-stratum-amber uppercase">
              02 — Stack
            </span>
          </div>

          <h2 className="font-heading text-4xl leading-tight font-bold tracking-tight text-stratum-text md:text-5xl">
            Technologies
            <br />
            <span className="text-stratum-text-dim">under the hood.</span>
          </h2>
        </div>

        <div
          ref={cardsRef}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TECHNOLOGIES.map((tech) => (
            <div
              key={tech.name}
              className="tech-card group rounded-lg border border-stratum-border/50 bg-stratum-surface/30 p-6 transition-all duration-300 hover:border-stratum-emerald/30 hover:bg-stratum-surface/60"
            >
              <div className="mb-1 font-heading text-[10px] font-bold tracking-[0.2em] text-stratum-emerald/60 uppercase transition-colors group-hover:text-stratum-emerald">
                {tech.category}
              </div>
              <div className="font-heading text-lg font-bold text-stratum-text">
                {tech.name}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stratum-text-dim">
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
