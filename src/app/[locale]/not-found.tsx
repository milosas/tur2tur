import Link from "next/link";
import { Button } from "@/components/ui/button";

const messages: Record<string, { title: string; description: string; back: string }> = {
  lt: {
    title: "Puslapis nerastas",
    description: "Atsiprašome, bet šis puslapis neegzistuoja arba buvo perkeltas.",
    back: "Grįžti į pradžią",
  },
  lv: {
    title: "Lapa nav atrasta",
    description: "Atvainojiet, bet šī lapa neeksistē vai ir pārcelta.",
    back: "Atgriezties sākumā",
  },
  ee: {
    title: "Lehte ei leitud",
    description: "Vabandust, kuid see leht ei eksisteeri või on teisaldatud.",
    back: "Tagasi avalehele",
  },
  en: {
    title: "Page not found",
    description: "Sorry, but this page does not exist or has been moved.",
    back: "Back to home",
  },
};

export default function NotFound() {
  // Show all languages so the user sees their language regardless of locale detection
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">{messages.en.title}</h2>
      <p className="text-sm text-muted-foreground mb-1">
        {messages.lt.title} · {messages.lv.title} · {messages.ee.title}
      </p>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto mt-4">
        {messages.en.description}
      </p>
      <Button asChild>
        <Link href="/">{messages.en.back}</Link>
      </Button>
    </div>
  );
}
