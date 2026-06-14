import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Globe, ChevronDown, Check } from "lucide-react"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "zh", label: "中文 (简体)" },
  ]

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="absolute top-4 right-4 z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:border-white/30 hover:bg-black/70"
      >
        <Globe className="h-3.5 w-3.5 text-stratum-emerald" />
        <span>{currentLang.label}</span>
        <ChevronDown className={`h-3 w-3 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-lg border border-white/10 bg-[#111]/95 p-1 shadow-2xl backdrop-blur-xl">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                setIsOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                i18n.language === lang.code
                  ? "bg-stratum-emerald/15 text-stratum-emerald"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {lang.label}
              {i18n.language === lang.code && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
