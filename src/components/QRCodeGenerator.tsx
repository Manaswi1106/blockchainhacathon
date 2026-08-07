import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  id?: string;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  id,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H', // High error correction allows center overlay
      },
      (error) => {
        if (error) console.error('[QRCode Generation Error]', error);
        else {
          // Draw center BP badge on canvas after rendering QR
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const badgeSize = Math.floor(size * 0.2);
          const x = (size - badgeSize) / 2;
          const y = (size - badgeSize) / 2;

          // Background box for logo
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x - 2, y - 2, badgeSize + 4, badgeSize + 4);

          ctx.fillStyle = '#0284c7'; // cyan-600
          ctx.roundRect
            ? ctx.roundRect(x, y, badgeSize, badgeSize, 6)
            : ctx.fillRect(x, y, badgeSize, badgeSize);
          ctx.fill();

          // Logo Text
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.floor(badgeSize * 0.45)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('BP', size / 2, size / 2 + 1);
        }
      }
    );
  }, [value, size]);

  return (
    <div
      id={id}
      className={`relative inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl border border-slate-200 ${className}`}
    >
      <canvas ref={canvasRef} width={size} height={size} className="rounded-xl" />
    </div>
  );
};
