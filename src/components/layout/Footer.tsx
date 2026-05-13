import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Zap } from "lucide-react";

export default function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Zap className="h-4 w-4 text-blue-400" />
              <span>TokenCenter</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("description")}</p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("links")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">{t("home")}</Link></li>
              <li><Link href="/calculator" className="hover:text-foreground transition-colors">{t("calculator")}</Link></li>
              <li><Link href="/compare" className="hover:text-foreground transition-colors">{t("compare")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("legal")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">{t("privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">{t("terms")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 space-y-1">
          <p className="text-xs text-muted-foreground">{t("disclaimer")}</p>
          <p className="text-xs text-muted-foreground">{t("copyright", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
