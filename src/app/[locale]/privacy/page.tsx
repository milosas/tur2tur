import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privatumo politika",
  description: "tur2tur privatumo politika. Sužinokite, kaip renkame, naudojame ir saugome jūsų asmens duomenis.",
};

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t("title")}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-2">{t("introTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("introDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("collectTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("collectDesc")}</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
            <li>{t("collectItem1")}</li>
            <li>{t("collectItem2")}</li>
            <li>{t("collectItem3")}</li>
            <li>{t("collectItem4")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("useTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("useDesc")}</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground mt-2">
            <li>{t("useItem1")}</li>
            <li>{t("useItem2")}</li>
            <li>{t("useItem3")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("sharingTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("sharingDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("cookiesTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("cookiesDesc")}</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">{t("rightsTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("rightsDesc")}</p>
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
