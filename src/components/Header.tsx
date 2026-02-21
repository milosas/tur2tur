"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, LogOut, UserCircle } from "lucide-react";
import { LogoOption7 } from "@/components/logos/LogoOption7";
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
      className={`sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "glass-intense border-b border-border/50 shadow-lg shadow-primary/5"
          : "bg-background/80 backdrop-blur-md border-b border-border/30"
      }`}
    >
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center transition-all hover:scale-105 active:scale-95">
            <LogoOption7 size={120} />
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              href="/tournaments"
              className="px-3 py-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
            >
              {t("tournaments")}
            </Link>
            <Link
              href="/formats"
              className="px-3 py-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
            >
              {t("formats")}
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
              >
                {t("dashboard")}
              </Link>
            )}
            <Link
              href="/pricing"
              className="px-3 py-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all duration-200"
            >
              {t("pricing")}
            </Link>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
                <Link href="/dashboard/profile">
                  <UserCircle className="h-4 w-4 mr-1" />
                  {t("profile")}
                </Link>
              </Button>
              <span className="text-sm text-foreground/60 truncate max-w-[150px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4 mr-1" />
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
                <Link href="/auth/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                <Link href="/auth/register">{t("register")}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile: language switcher + menu button */}
        <div className="md:hidden flex items-center gap-1">
          <LanguageSwitcher />
          <button
            className="p-2 rounded-lg hover:bg-primary/10 transition-all tap-target"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <div className="relative w-6 h-6">
              <Menu className={`h-6 w-6 absolute inset-0 transition-all duration-300 text-foreground ${mobileOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
              <X className={`h-6 w-6 absolute inset-0 transition-all duration-300 text-foreground ${mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          style={{ touchAction: "none" }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Menu panel */}
        <div
          className={`relative bg-background border-t border-border shadow-2xl transition-[transform,opacity] duration-300 ease-out overscroll-y-contain ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-4 py-3">
            <Link
              href="/tournaments"
              className="flex items-center text-base py-3 px-4 rounded-xl text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all tap-target"
              onClick={() => setMobileOpen(false)}
            >
              {t("tournaments")}
            </Link>
            <Link
              href="/formats"
              className="flex items-center text-base py-3 px-4 rounded-xl text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all tap-target"
              onClick={() => setMobileOpen(false)}
            >
              {t("formats")}
            </Link>
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center text-base py-3 px-4 rounded-xl text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all tap-target"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center text-base py-3 px-4 rounded-xl text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all tap-target"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("profile")}
                </Link>
              </>
            )}
            <Link
              href="/pricing"
              className="flex items-center text-base py-3 px-4 rounded-xl text-foreground/70 hover:text-foreground hover:bg-primary/10 transition-all tap-target"
              onClick={() => setMobileOpen(false)}
            >
              {t("pricing")}
            </Link>
          </nav>
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
            <ThemeToggle />
            <div className="flex-1" />
            {user ? (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="tap-target hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="h-4 w-4 mr-1" />
                {t("logout")}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm" className="tap-target hover:bg-primary/10">
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
                </Button>
                <Button asChild size="sm" className="tap-target bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
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
