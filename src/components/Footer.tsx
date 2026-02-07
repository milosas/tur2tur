import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col md:flex-row items-center justify-between py-6 mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          © {year} Turnyrų Lentelės. {t("rights")}
        </p>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground mt-4 md:mt-0">
          <span className="hover:text-foreground transition-colors cursor-pointer">{t("about")}</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">{t("privacy")}</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">{t("terms")}</span>
        </nav>
      </div>
    </footer>
  );
}
