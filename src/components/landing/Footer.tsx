import { ArrowRight } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-stratum-void pt-20 pb-10">
      {/* Premium Gradient Divider */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-stratum-emerald via-stratum-amber to-stratum-emerald opacity-50" />
      <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-stratum-emerald via-stratum-amber to-stratum-emerald opacity-80 blur-[2px]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 transition-all duration-500 ease-in-out md:px-16 lg:px-24">
        {/* Top Section */}
        <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div className="max-w-md">
            <div className="font-heading text-3xl font-bold tracking-tight text-stratum-text">
              Stratum<span className="text-stratum-emerald">3D</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stratum-text-dim">
              A cinematic, real-time WebGL orbital exploration experience.
              Descend from the vacuum of space to the surface of the Earth.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:w-80">
            <label className="font-heading text-[10px] font-bold tracking-[0.2em] text-stratum-text-dim uppercase">
              Join the Orbital Newsletter
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="Transmission frequency..."
                className="w-full rounded border border-stratum-border/50 bg-stratum-surface/30 px-4 py-3 text-sm text-stratum-text transition-all outline-none placeholder:text-stratum-text-dim/50 focus:border-stratum-emerald/50 focus:bg-stratum-surface/80"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded bg-stratum-emerald/10 p-1.5 text-stratum-emerald transition-colors hover:bg-stratum-emerald/20"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col-reverse justify-between gap-8 border-t border-stratum-border/30 pt-8 md:flex-row md:items-center">
          <p className="text-center text-[10px] tracking-widest text-stratum-text-dim/60 uppercase md:text-left">
            &copy; {currentYear} Stratum 3D. All rights reserved.
          </p>

          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <nav className="flex gap-8" aria-label="Footer navigation">
              <a
                href="#about"
                className="text-xs font-semibold tracking-wider text-stratum-text-dim uppercase transition-colors hover:text-stratum-text"
              >
                About
              </a>
              <a
                href="#technologies"
                className="text-xs font-semibold tracking-wider text-stratum-text-dim uppercase transition-colors hover:text-stratum-text"
              >
                Stack
              </a>
              <a
                href="#roadmap"
                className="text-xs font-semibold tracking-wider text-stratum-text-dim uppercase transition-colors hover:text-stratum-text"
              >
                Roadmap
              </a>
            </nav>

            <a
              href="https://github.com/TanvirSaini0091"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-stratum-surface/50 text-stratum-text-dim transition-all hover:bg-stratum-emerald/10 hover:text-stratum-emerald hover:shadow-[0_0_15px_rgba(52,211,153,0.2)]"
              aria-label="View source on GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
