import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";

interface Props {
  url: string;
  name: string;
}

export function QRCodeDisplay({ url, name }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 200,
      margin: 2,
      color: { dark: "#c8a96e", light: "#0a0a0a" },
    }).then(() => setGenerated(true));
  }, [url]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-memorial-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-[#0a0a0a] border border-gold/20 rounded-sm">
        <canvas ref={canvasRef} />
      </div>
      {generated && (
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-sm text-[11px] tracking-[0.25em] uppercase hover:border-gold transition-colors"
        >
          <Download className="w-4 h-4" />
          Download QR Code
        </button>
      )}
    </div>
  );
}
