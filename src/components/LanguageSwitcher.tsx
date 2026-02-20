"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locales = [
  { code: "lt", label: "Lietuvių", country: "lt" },
  { code: "lv", label: "Latviešu", country: "lv" },
  { code: "ee", label: "Eesti", country: "ee" },
  { code: "en", label: "English", country: "gb" },
];

function Flag({ country, size = 20 }: { country: string; size?: number }) {
  return (
    <Image
      src={`https://flagcdn.com/w40/${country}.png`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      className="inline-block rounded-sm object-cover"
      style={{ width: size, height: Math.round(size * 0.75) }}
    />
  );
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = locales.find((l) => l.code === locale);

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Select language" className="gap-1.5">
          {currentLocale && <Flag country={currentLocale.country} size={18} />}
          {currentLocale?.code.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLocale(l.code)}
            className={`gap-2 ${l.code === locale ? "bg-accent" : ""}`}
          >
            <Flag country={l.country} size={20} />
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
