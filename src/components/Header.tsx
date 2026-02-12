"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const t = useTranslations("Nav");
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glass border-b shadow-sm"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      }`}
    >
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold flex items-center gap-1.5 transition-transform active:scale-95">
            <span className="text-xl">🏆</span>
            <span className="hidden sm:inline">{t("home")}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="/tournaments"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {t("tournaments")}
            </Link>
            <Link
              href="/formats"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {t("formats")}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                {t("dashboard")}
              </Link>
            )}
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <>
              <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">{t("register")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors tap-target"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <div className="relative w-5 h-5">
            <Menu className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
            <X className={`h-5 w-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 top-14 z-40 transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={`relative bg-background border-t shadow-xl transition-all duration-300 ease-out ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-4 py-3">
            <Link
              href="/tournaments"
              className="flex items-center text-base py-3 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all tap-target"
              onClick={() => setMobileOpen(false)}
            >
              {t("tournaments")}
            </Link>
            <Link
              href="/formats"
              className="flex items-center text-base py-3 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all tap-target"
              onClick={() => setMobileOpen(false)}
            >
              {t("formats")}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center text-base py-3 px-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all tap-target"
                onClick={() => setMobileOpen(false)}
              >
                {t("dashboard")}
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2 px-4 py-3 border-t">
            <LanguageSwitcher />
            <div className="flex-1" />
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="tap-target">
                <LogOut className="h-4 w-4 mr-1" />
                {t("logout")}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm" className="tap-target">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
                </Button>
                <Button asChild size="sm" className="tap-target">
                  <Link href="/auth/register" onClick={() => setMobileOpen(false)}>{t("register")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
