"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

const MAX_COLORS = 4;

export function ColorPicker({
  colors,
  onChange,
}: {
  colors: string[];
  onChange: (colors: string[]) => void;
}) {
  const t = useTranslations("Dashboard");

  function handleColorChange(index: number, value: string) {
    const next = [...colors];
    next[index] = value;
    onChange(next);
  }

  function addColor() {
    if (colors.length < MAX_COLORS) {
      onChange([...colors, "#3b82f6"]);
    }
  }

  function removeColor(index: number) {
    onChange(colors.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <Label>{t("accentColors")}</Label>
      <p className="text-xs text-muted-foreground">{t("colorHint")}</p>
      <div className="flex items-center gap-3 flex-wrap">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(i, e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-border bg-transparent"
            />
            <span className="text-xs font-mono text-muted-foreground">
              {color}
            </span>
            <button
              type="button"
              onClick={() => removeColor(i)}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("removeColor")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {colors.length < MAX_COLORS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addColor}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("addColor")}
          </Button>
        )}
      </div>
    </div>
  );
}
