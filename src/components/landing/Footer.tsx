import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-neutral-950 p-8 font-sans text-neutral-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        {/* Top Section */}
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div className="max-w-md">
            <div className="text-3xl font-extrabold tracking-tight text-white">
              Stratum<span className="text-stratum-emerald">3D</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              {t("footer.description")}
            </p>
          </div>

          <div className="flex flex-col gap-3 md:w-80">
            <label className="text-xs font-bold tracking-[0.2em] text-neutral-500 uppercase">
              {t("footer.newsletterLabel")}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                className="w-full rounded border border-neutral-800 bg-transparent px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-neutral-600 focus:border-neutral-600"
              />
              <button
                type="button"
                className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center rounded bg-neutral-800 p-1.5 text-neutral-300 transition-colors hover:bg-neutral-700 hover:text-white"
                aria-label={t("footer.subscribe")}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col-reverse justify-between gap-8 border-t border-neutral-800 pt-8 md:flex-row md:items-center">
          <p className="text-center text-xs text-neutral-500 md:text-left">
            {t("footer.allRightsReserved", { year: currentYear })}
          </p>

          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
            <nav className="flex gap-6" aria-label="Footer navigation">
              <a
                href="#about"
                className="text-xs font-bold tracking-[0.15em] text-neutral-500 uppercase transition-colors hover:text-neutral-300"
              >
                {t("footer.about")}
              </a>
              <a
                href="#technologies"
                className="text-xs font-bold tracking-[0.15em] text-neutral-500 uppercase transition-colors hover:text-neutral-300"
              >
                {t("footer.stack")}
              </a>
              <a
                href="#roadmap"
                className="text-xs font-bold tracking-[0.15em] text-neutral-500 uppercase transition-colors hover:text-neutral-300"
              >
                {t("footer.roadmap")}
              </a>
            </nav>

            <a
              href="https://github.com/TanvirSaini0091"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-transparent text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
              aria-label={t("footer.githubLabel")}
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