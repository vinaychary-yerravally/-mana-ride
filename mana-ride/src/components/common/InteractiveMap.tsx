import React, { useEffect, useRef } from 'react';

interface InteractiveMapProps {
  mode?: 'customer' | 'driver' | 'searching' | 'in_progress' | 'pickup';
  darkMode?: boolean;
  routeProgress?: number; // 0 to 100
  pickupLabel?: string;
  destinationLabel?: string;
  onRecenter?: () => void;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mode = 'customer',
  darkMode = false,
  routeProgress = 35,
  pickupLabel = '1st Block Koramangala',
  destinationLabel = "Kempegowda Int'l Airport",
  onRecenter,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      // Base background color
      ctx.fillStyle = darkMode ? '#0F172A' : '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle dot grid pattern
      const dotSpacing = 24;
      ctx.fillStyle = darkMode ? '#334155' : '#CBD5E1';
      for (let x = 12; x < width; x += dotSpacing) {
        for (let y = 12; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw stylized city blocks
      ctx.fillStyle = darkMode ? '#1E293B' : '#FFFFFF';
      const gridSize = 48;
      for (let x = 14; x < width; x += gridSize + 14) {
        for (let y = 14; y < height; y += gridSize + 14) {
          ctx.beginPath();
          ctx.roundRect(x, y, gridSize, gridSize, 8);
          ctx.fill();
          ctx.strokeStyle = darkMode ? '#334155' : '#E2E8F0';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw major roads
      ctx.strokeStyle = darkMode ? '#334155' : '#E2E8F0';
      ctx.lineWidth = 16;
      ctx.beginPath();
      // Main diagonal boulevard
      ctx.moveTo(0, height * 0.75);
      ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.6, height * 0.4, width, height * 0.15);
      ctx.stroke();

      // Cross avenue
      ctx.beginPath();
      ctx.moveTo(width * 0.2, 0);
      ctx.lineTo(width * 0.8, height);
      ctx.stroke();

      // Horizontal arterial road
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width, height * 0.45);
      ctx.stroke();

      // Road center lane markings
      ctx.strokeStyle = darkMode ? '#475569' : '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(0, height * 0.75);
      ctx.bezierCurveTo(width * 0.3, height * 0.6, width * 0.6, height * 0.4, width, height * 0.15);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw park area
      ctx.fillStyle = darkMode ? '#064E3B' : '#ECFDF5';
      ctx.strokeStyle = darkMode ? '#047857' : '#A7F3D0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(width * 0.08, height * 0.18, width * 0.28, height * 0.2, 10);
      ctx.fill();
      ctx.stroke();

      // Draw water body / river
      ctx.fillStyle = darkMode ? '#0C4A6E' : '#F0F9FF';
      ctx.strokeStyle = darkMode ? '#0284C7' : '#BAE6FD';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.7, 0);
      ctx.bezierCurveTo(width * 0.65, height * 0.3, width * 0.85, height * 0.6, width, height * 0.8);
      ctx.lineTo(width, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // If in searching mode, draw animated radar rings
      if (mode === 'searching') {
        const cx = width / 2;
        const cy = height * 0.38;

        for (let i = 0; i < 3; i++) {
          const progress = (time * 0.8 + i * 0.33) % 1;
          const radius = progress * 140 + 20;
          const opacity = Math.max(0, 1 - progress);
          ctx.strokeStyle = `rgba(79, 70, 229, ${opacity * 0.6})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center search pin
        ctx.fillStyle = '#4F46E5';
        ctx.shadowColor = 'rgba(79, 70, 229, 0.4)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // If active route exists (in_progress, pickup, fare_details)
      if (mode === 'in_progress' || mode === 'pickup' || mode === 'customer') {
        const startX = width * 0.25;
        const startY = height * 0.68;
        const endX = width * 0.75;
        const endY = height * 0.22;

        // Animated route polyline
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -time * 20;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(width * 0.35, height * 0.4, endX, endY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Pickup Marker (Indigo circle)
        ctx.fillStyle = '#4F46E5';
        ctx.beginPath();
        ctx.arc(startX, startY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Destination Marker (Red marker)
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(endX, endY, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Moving Car along the path
        const t = (routeProgress / 100);
        const p0x = startX;
        const p0y = startY;
        const p1x = width * 0.35;
        const p1y = height * 0.4;
        const p2x = endX;
        const p2y = endY;

        const carX = Math.pow(1 - t, 2) * p0x + 2 * (1 - t) * t * p1x + Math.pow(t, 2) * p2x;
        const carY = Math.pow(1 - t, 2) * p0y + 2 * (1 - t) * t * p1y + Math.pow(t, 2) * p2y;

        // Car icon pill
        ctx.save();
        ctx.translate(carX, carY);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(-16, -16, 32, 32, 8);
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner car symbol
        ctx.fillStyle = '#4F46E5';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Nearby moving vehicles (simulated fleet)
      const fleet = [
        { x: width * 0.3 + Math.sin(time) * 15, y: height * 0.35 + Math.cos(time) * 10, angle: 45 },
        { x: width * 0.65 + Math.cos(time * 0.7) * 20, y: height * 0.55 + Math.sin(time * 0.7) * 15, angle: -30 },
        { x: width * 0.8 + Math.sin(time * 0.5) * 10, y: height * 0.75, angle: 90 }
      ];

      fleet.forEach((c) => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.fillStyle = darkMode ? '#1E293B' : '#FFFFFF';
        ctx.shadowColor = 'rgba(15, 23, 42, 0.1)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(-12, -12, 24, 24, 6);
        ctx.fill();
        ctx.strokeStyle = darkMode ? '#4F46E5' : '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Mini vehicle icon dot
        ctx.fillStyle = darkMode ? '#818CF8' : '#4F46E5';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, darkMode, routeProgress]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        width={480}
        height={800}
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* Recenter & Map control floating buttons */}
      <div className="absolute right-3.5 top-20 flex flex-col gap-2 z-10">
        <button
          onClick={onRecenter}
          className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
          title="Recenter Map"
        >
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
        <button
          className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
          title="Compass"
        >
          <span className="material-symbols-outlined text-[18px]">explore</span>
        </button>
      </div>
    </div>
  );
};
