"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, Download } from "lucide-react";

export function TournamentQR({
  tournamentId,
  tournamentName,
  locale,
}: {
  tournamentId: string;
  tournamentName: string;
  locale: string;
}) {
  const t = useTranslations("Tournaments");
  const [open, setOpen] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/tournaments/${tournamentId}`
      : `/${locale}/tournaments/${tournamentId}`;

  function downloadQR() {
    const svg = document.getElementById(`qr-${tournamentId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `${tournamentName.replace(/\s+/g, "-")}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-1.5" />
          {t("qrCode")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{tournamentName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id={`qr-${tournamentId}`}
              value={url}
              size={220}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center break-all px-4">
            {url}
          </p>
          <Button variant="outline" size="sm" onClick={downloadQR}>
            <Download className="h-4 w-4 mr-1.5" />
            {t("downloadQR")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
