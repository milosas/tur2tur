import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Puslapis nerastas</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Atsiprašome, bet šis puslapis neegzistuoja arba buvo perkeltas.
      </p>
      <Button asChild>
        <Link href="/">Grįžti į pradžią</Link>
      </Button>
    </div>
  );
}
