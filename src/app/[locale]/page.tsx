import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up">
          {t("title")}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {t("subtitle")}
        </p>
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 h-11 sm:h-12 transition-transform active:scale-95 hover:shadow-lg">
            <Link href="/dashboard">{t("cta")}</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 stagger-children">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-2xl">🏆</span> {t("features.organize")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("features.organizeDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-2xl">👥</span> {t("features.manage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("features.manageDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift sm:col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="text-2xl">📊</span> {t("features.track")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("features.trackDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
