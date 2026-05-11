"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import Link from "next/link";
import { useState } from "react";
import { Globe, Menu, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  fr: "Français",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
  ja: "日本語",
  ar: "العربية",
  ko: "한국어",
  id: "Indonesia",
  ru: "Русский",
  vi: "Tiếng Việt",
};

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
    setLangOpen(false);
  }

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/calculator", label: t("calculator") },
    { href: "/compare", label: t("compare") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-900">
          <Zap className="h-4 w-4 text-blue-500" />
          <span>TokenCenter</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-neutral-600"
              onClick={() => setLangOpen((o) => !o)}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{localeNames[locale]}</span>
            </Button>

            {langOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLocale(l)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-neutral-50 ${
                        l === locale ? "font-medium text-blue-600" : "text-neutral-700"
                      }`}
                    >
                      {localeNames[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-neutral-600 hover:text-neutral-900"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
