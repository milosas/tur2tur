import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 bg-background/80 backdrop-blur-md">
      <div className="container flex flex-col md:flex-row items-center justify-between py-8 mx-auto px-4">
        <p className="text-sm text-foreground/60">
          © {year} tur2tur.com {t("rights")}
        </p>
        <nav className="flex items-center gap-6 text-sm text-foreground/60 mt-4 md:mt-0">
          <Link href="/about" className="hover:text-primary transition-all duration-200">{t("about")}</Link>
          <Link href="/privacy" className="hover:text-primary transition-all duration-200">{t("privacy")}</Link>
          <Link href="/terms" className="hover:text-primary transition-all duration-200">{t("terms")}</Link>
        </nav>
      </div>
    </footer>
  );
}
