import React, { useEffect, useRef } from 'react';
import type { CableTypeCategory } from '../../core/interfaces/cable';
import { CableTypeCategoryEnum } from '../../core/interfaces/cable';

interface Props {
  cableType: CableTypeCategory;
}

export const CableCanvas: React.FC<Props> = ({ cableType }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Background preview box
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, width, height);

    // Draw Cable Cross Section based on type
    ctx.lineWidth = 3;

    if (cableType === CableTypeCategoryEnum.XLPE_HV) {
      // Outer conductor (Sarı çember)
      ctx.strokeStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
      ctx.stroke();

      // XLPE Layer (Yeşil)
      ctx.strokeStyle = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner Semi-Conductor (Mavi)
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.stroke();

      // Conductor core (Kırmızı)
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX + 5, centerY - 3, 50, 0, Math.PI * 2); // Eksen kaçıklığı simulasyonu
      ctx.fill();
      ctx.stroke();

      // Centers O1, O2
      ctx.fillStyle = '#eab308';
      ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(centerX + 2, centerY - 6, 6, 6);

      // Radial measurement lines (60 degrees)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * 180, centerY + Math.sin(angle) * 180);
        ctx.stroke();
      }
      ctx.setLineDash([]);

    } else if (cableType === CableTypeCategoryEnum.NYIF) {
      // Flat bridged cable
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(centerX - 180, centerY - 70, 360, 140);

      // Core 1
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX - 90, centerY, 45, 0, Math.PI * 2);
      ctx.stroke();

      // Core 2
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX + 90, centerY, 45, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // Generic circular cable
      ctx.strokeStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

  }, [cableType]);

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={420}
      style={{
        borderRadius: '8px',
        border: '1px solid #2a2a38',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}
    />
  );
};
