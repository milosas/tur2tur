import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../globals.css";

const GA_ID = "G-LRVHKZ7LM5";
const FB_PIXEL_ID = "1465582565170856";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "tur2tur — Baltic Tournament Planner",
    template: "%s | tur2tur",
  },
  description:
    "Create and manage sports tournaments in the Baltic region. Group stages, playoffs, brackets, live scores — all in one place.",
  metadataBase: new URL("https://tur2tur.com"),
  openGraph: {
    type: "website",
    siteName: "tur2tur",
    title: "tur2tur — Baltic Tournament Planner",
    description:
      "Create and manage sports tournaments in the Baltic region. Group stages, playoffs, brackets, live scores.",
    url: "https://tur2tur.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "tur2tur — Baltic Tournament Planner",
    description:
      "Create and manage sports tournaments in the Baltic region.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* Google Analytics (GA4) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>

      {/* Meta (Facebook) Pixel */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "tur2tur",
            url: "https://tur2tur.com",
            description:
              "Create and manage sports tournaments in the Baltic region. Group stages, playoffs, brackets, live scores.",
            applicationCategory: "SportsApplication",
            operatingSystem: "Web",
            offers: [
              {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
                description: "Free tier — up to 5 tournaments per month",
              },
              {
                "@type": "Offer",
                price: "5.00",
                priceCurrency: "EUR",
                description: "Single tournament credit",
              },
              {
                "@type": "Offer",
                price: "9.90",
                priceCurrency: "EUR",
                description: "Unlimited monthly subscription",
              },
            ],
            availableLanguage: ["lt", "lv", "et", "en"],
            areaServed: ["LT", "LV", "EE"],
          }),
        }}
      />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
