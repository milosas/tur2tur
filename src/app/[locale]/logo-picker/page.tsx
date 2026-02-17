import { LogoVariant1 } from "@/components/logos/LogoVariant1";
import { LogoVariant2 } from "@/components/logos/LogoVariant2";
import { LogoVariant3 } from "@/components/logos/LogoVariant3";
import { LogoVariant4 } from "@/components/logos/LogoVariant4";
import { LogoVariant5 } from "@/components/logos/LogoVariant5";

const variants = [
  { id: 1, Component: LogoVariant1, desc: "Classic trophy cup with star — clean, symmetric" },
  { id: 2, Component: LogoVariant2, desc: "Modern geometric trophy — angular, bold, sporty" },
  { id: 3, Component: LogoVariant3, desc: "Champions League inspired — big ears, stars above" },
  { id: 4, Component: LogoVariant4, desc: "Minimal flat trophy — clean lines, SaaS style, big \"2\"" },
  { id: 5, Component: LogoVariant5, desc: "Dynamic trophy with energy sparks — sporty, energetic" },
];

export default function LogoPickerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">tur2tur Logo Variants</h1>
      <p className="text-muted-foreground mb-8">
        Pick your favorite logo variant. All feature a gold trophy cup with &quot;tur2tur&quot; branding.
      </p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {variants.map(({ id, Component, desc }) => (
          <div
            key={id}
            className="rounded-xl border p-8 flex flex-col items-center gap-4 hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center">
              <Component size={120} />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Variant {id}</p>
              <p className="text-sm text-muted-foreground mt-1">{desc}</p>
            </div>
            {/* Small preview at header size */}
            <div className="flex items-center gap-3 mt-2 p-3 rounded-lg bg-background border">
              <Component size={32} />
              <span className="text-sm text-muted-foreground">Header preview</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
