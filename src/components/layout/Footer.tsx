import { useTranslations } from "next-intl";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-neutral-900">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>TokenCenter</span>
            </div>
            <p className="text-sm text-neutral-500">{t("description")}</p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {t("links")}
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/" className="hover:text-neutral-900">Home</Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-neutral-900">Calculator</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-neutral-900">Compare</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {t("legal")}
            </p>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/privacy" className="hover:text-neutral-900">{t("privacy")}</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-neutral-900">{t("terms")}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-6 space-y-1">
          <p className="text-xs text-neutral-400">{t("disclaimer")}</p>
          <p className="text-xs text-neutral-400">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
