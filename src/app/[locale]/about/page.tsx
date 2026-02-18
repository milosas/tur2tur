import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Globe, Mail } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <>
      <PageBanner
        title={t("title")}
        photo="team"
      />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {t("intro")}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <Card>
            <CardContent className="pt-6">
              <Trophy className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{t("missionTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("missionDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{t("whoTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("whoDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{t("regionTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("regionDesc")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Mail className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{t("contactTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("contactDesc")}
                <a href="mailto:info@tur2tur.com" className="text-primary hover:underline ml-1">
                  info@tur2tur.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h2 className="text-xl font-bold mb-3">{t("whyTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("whyDesc")}</p>
          <h2 className="text-xl font-bold mb-3">{t("valuesTitle")}</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t("value1")}</li>
            <li>{t("value2")}</li>
            <li>{t("value3")}</li>
            <li>{t("value4")}</li>
          </ul>
        </div>
      </div>
    </>
  );
}
