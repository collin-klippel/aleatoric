import { useEffect, useRef } from 'react';
import type * as Tone from 'tone';

interface OscilloscopeProps {
  getAnalyser: () => Tone.Analyser | null;
}

export function Oscilloscope({ getAnalyser }: OscilloscopeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const readColors = () => {
      const cs = getComputedStyle(wrap);
      return {
        bg: cs.getPropertyValue('--bg-2').trim() || '#1c1f2b',
        accent: cs.getPropertyValue('--accent').trim() || '#7c6af7',
        grid: cs.getPropertyValue('--border').trim() || '#2e3244',
      };
    };

    let colors = readColors();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      colors = readColors();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let rafId = 0;

    const draw = () => {
      rafId = requestAnimationFrame(draw);
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w < 1 || h < 1) return;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const midY = h / 2;
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      ctx.stroke();

      const analyser = getAnalyser();
      if (!analyser) return;

      const raw = analyser.getValue();
      const buf = Array.isArray(raw) ? raw[0] : raw;
      const n = buf.length;
      if (n < 2) return;

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const amp = h * 0.42;
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * w;
        const y = midY - buf[i] * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [getAnalyser]);

  return (
    <div className="oscilloscope" ref={wrapRef}>
      <canvas ref={canvasRef} className="oscilloscope-canvas" aria-hidden />
    </div>
  );
}
