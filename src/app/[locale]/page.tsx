import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, BarChart3, PlusCircle, Send, Play } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("Home");
  const tNav = useTranslations("Nav");

  const steps = [
    { icon: PlusCircle, title: t("step1Title"), desc: t("step1Desc"), num: "01" },
    { icon: Send, title: t("step2Title"), desc: t("step2Desc"), num: "02" },
    { icon: Play, title: t("step3Title"), desc: t("step3Desc"), num: "03" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <Trophy className="h-3.5 w-3.5" />
            {tNav("tournaments")}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up leading-[1.1]">
            {t("title")}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: "100ms" }}>
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Button asChild size="lg" className="text-base sm:text-lg px-8 h-12 transition-transform active:scale-95 hover:shadow-lg w-full sm:w-auto">
              <Link href="/dashboard">{t("cta")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-8 h-12 w-full sm:w-auto">
              <Link href="/formats">{tNav("formats")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 stagger-children">
          <Card className="hover-lift border-t-2 border-t-primary/20">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                {t("features.organize")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("features.organizeDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-t-2 border-t-primary/20">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                {t("features.manage")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("features.manageDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-t-2 border-t-primary/20 sm:col-span-2 md:col-span-1">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                {t("features.track")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {t("features.trackDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 animate-fade-in-up">
              {t("howItWorks")}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
              {t("howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-12 max-w-4xl mx-auto stagger-children">
            {steps.map((step) => (
              <div key={step.num} className="text-center group">
                <div className="relative mb-5">
                  <span className="text-6xl sm:text-7xl font-black text-primary/[0.07] absolute inset-0 flex items-center justify-center select-none">
                    {step.num}
                  </span>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto relative transition-transform group-hover:scale-110">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="relative rounded-2xl bg-primary/[0.03] border border-primary/10 p-8 sm:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 animate-fade-in-up">
            {t("finalCtaTitle")}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto">
            {t("finalCtaSubtitle")}
          </p>
          <Button asChild size="lg" className="text-base sm:text-lg px-8 h-12 transition-transform active:scale-95 hover:shadow-lg">
            <Link href="/dashboard">{t("finalCta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
