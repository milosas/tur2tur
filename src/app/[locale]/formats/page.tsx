import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Swords, RefreshCw } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formatai",
  description: "Turnyrų formatai: grupės + atkrintamosios, ratų sistema, viengubas eliminavimas ir grupės su perskirstymu. Pasirinkite tinkamiausią formatą savo turnyrui.",
};

const formatConfigs = [
  { key: "groupPlayoff", icon: Trophy, color: "text-yellow-600" },
  { key: "roundRobin", icon: RefreshCw, color: "text-blue-600" },
  { key: "singleElimination", icon: Swords, color: "text-red-600" },
  { key: "groupReclass", icon: Users, color: "text-green-600" },
] as const;

export default function FormatsPage() {
  const t = useTranslations("Formats");

  return (
    <>
      <PageBanner
        title={t("title")}
        subtitle={t("subtitle")}
        photo="stadium"
      />
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="space-y-4 sm:space-y-8 stagger-children">
          {formatConfigs.map(({ key, icon: Icon, color }) => (
            <Card key={key} className="hover-lift overflow-hidden">
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-muted ${color}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <CardTitle className="text-base sm:text-xl">{t(`${key}.name`)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base text-muted-foreground">{t(`${key}.desc`)}</p>

                <div>
                  <h3 className="font-semibold text-sm mb-1.5 sm:mb-2">{t("howItWorksLabel")}</h3>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line bg-muted/50 rounded-lg p-3 sm:p-4">
                    {t(`${key}.howItWorks`)}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1 text-xs">{t("bestForLabel")}</Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(`${key}.bestFor`)}</p>
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1 text-xs">{t("exampleLabel")}</Badge>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t(`${key}.example`)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
