import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, BarChart3, PlusCircle, Send, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HomeTournaments } from "./HomeTournaments";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");

  let tournaments: any[] | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("tournaments")
      .select("*, profiles(full_name, email, avatar_url), teams(count)")
      .eq("visibility", "public")
      .neq("status", "draft")
      .order("start_date", { ascending: false, nullsFirst: false });
    tournaments = data;
  } catch {
    // Supabase connection failed — render page without tournaments
  }

  const steps = [
    { icon: PlusCircle, title: t("step1Title"), desc: t("step1Desc"), num: "01" },
    { icon: Send, title: t("step2Title"), desc: t("step2Desc"), num: "02" },
    { icon: Play, title: t("step3Title"), desc: t("step3Desc"), num: "03" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex items-center">
        {/* Photo Mosaic Background */}
        <div className="absolute inset-0 -z-10">
          <div className="hero-mosaic">
            <div className="hero-mosaic-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80)' }} />
            <div className="hero-mosaic-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80)' }} />
            <div className="hero-mosaic-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80)' }} />
            <div className="hero-mosaic-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80)' }} />
            <div className="hero-mosaic-item" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80)' }} />
            <div className="hero-mosaic-item" style={{ backgroundImage: 'url(https://images.pexels.com/photos/33641987/pexels-photo-33641987.jpeg?auto=compress&cs=tinysrgb&w=800)' }} />
          </div>
          <div className="absolute inset-0 hero-mosaic-overlay" />
        </div>

        <div className="container mx-auto px-4 py-20 sm:py-28 text-center relative">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 sm:mb-10 animate-fade-in-up leading-[1.05] text-white drop-shadow-2xl">
            {t("title")}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-12 sm:mb-16 max-w-4xl mx-auto animate-fade-in-up leading-relaxed font-medium drop-shadow-lg" style={{ animationDelay: "100ms" }}>
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Button asChild size="lg" className="text-lg sm:text-xl px-12 h-16 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto rounded-2xl font-bold">
              <Link href="/dashboard">{t("cta")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg sm:text-xl px-12 h-16 w-full sm:w-auto rounded-2xl glass-intense border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-black font-semibold backdrop-blur-md">
              <Link href="/formats">{tNav("formats")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tournaments Section */}
      {tournaments && tournaments.length > 0 && (
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <HomeTournaments tournaments={tournaments} />
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 sm:py-32">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 stagger-children">
          <Card className="rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-sm hover:shadow-md">
            <CardHeader className="space-y-5 pt-8">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {t("features.organize")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t("features.organizeDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-sm hover:shadow-md">
            <CardHeader className="space-y-5 pt-8">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {t("features.manage")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t("features.manageDesc")}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl overflow-hidden group sm:col-span-2 md:col-span-1 hover:scale-[1.02] transition-all duration-500 shadow-sm hover:shadow-md">
            <CardHeader className="space-y-5 pt-8">
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                {t("features.track")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {t("features.trackDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 sport-strip-bg" />

        <div className="container mx-auto px-4 py-24 sm:py-36 relative">
          <div className="text-center mb-20 sm:mb-28">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-fade-in-up bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
              {t("howItWorks")}
            </h2>
            <p className="text-foreground/70 text-xl sm:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
              {t("howItWorksSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 sm:gap-20 max-w-6xl mx-auto stagger-children">
            {steps.map((step) => (
              <div key={step.num} className="text-center group">
                <div className="relative mb-8">
                  <span className="text-[140px] sm:text-[160px] font-black bg-gradient-to-br from-primary/15 to-secondary/8 bg-clip-text text-transparent absolute inset-0 flex items-center justify-center select-none leading-none">
                    {step.num}
                  </span>
                  <div className="h-24 w-24 rounded-3xl glass-intense border-glow flex items-center justify-center mx-auto relative transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-primary/30 backdrop-blur-xl">
                    <step.icon className="h-11 w-11 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">{step.title}</h3>
                <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-4 py-20 sm:py-32">
        <div
          className="relative rounded-3xl overflow-hidden group border border-primary/20 hover:border-primary/40 transition-all duration-500 cta-bg-image"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1567427018141-0584cfcbf1b6?w=1920&q=80)'
          }}
        >
          <div className="absolute inset-0 cta-overlay" />
          <div className="relative p-12 sm:p-20 md:p-24 text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 animate-fade-in-up text-white drop-shadow-2xl leading-tight">
              {t("finalCtaTitle")}
            </h2>
            <p className="text-white/90 text-xl sm:text-2xl md:text-3xl mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg">
              {t("finalCtaSubtitle")}
            </p>
            <Button asChild size="lg" className="text-xl sm:text-2xl px-14 h-18 sm:h-20 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 hover:scale-105 active:scale-95 rounded-2xl font-bold">
              <Link href="/dashboard">{t("finalCta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
