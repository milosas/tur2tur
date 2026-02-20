import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Naudojimo sąlygos",
  description: "tur2tur naudojimo sąlygos. Susipažinkite su platformos naudojimo taisyklėmis ir sąlygomis.",
};

export default function TermsPage() {
  const t = useTranslations("Terms");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">{t("acceptanceTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("acceptanceDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("serviceTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("serviceDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("accountTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("accountDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("contentTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("contentDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("paymentTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("paymentDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("terminationTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("terminationDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("liabilityTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("liabilityDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("changesTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("changesDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("contactTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {t("contactDesc")}{" "}
            <a href="mailto:info@tur2tur.com" className="text-primary hover:underline">
              info@tur2tur.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
