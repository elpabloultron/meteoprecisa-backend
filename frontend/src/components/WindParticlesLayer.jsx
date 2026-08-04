import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export default function WindParticlesLayer({ active }) {
  const map = useMap();
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active || !map) return;

    // Crear canvas overlay
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '600'; // z-index superior para estar siempre visible
    
    const container = map.getPanes().overlayPane;
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const resizeCanvas = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };

    resizeCanvas();
    map.on('resize move moveend zoomend', resizeCanvas);

    // Generar partículas de viento
    const particleCount = 160;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      vx: (Math.random() - 0.2) * 2.0 + 1.2, // Flujo predominante Pacífico
      vy: (Math.random() - 0.5) * 1.0,
      life: Math.random() * 80 + 20,
      maxLife: 100,
      color: Math.random() > 0.3 ? '#38bdf8' : '#06b6d4'
    }));

    const ctx = canvas.getContext('2d');

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.0;

      particles.forEach((p) => {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (p.life <= 0 || p.x > canvas.width || p.y > canvas.height || p.x < 0 || p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.life = p.maxLife;
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      map.off('resize move moveend zoomend', resizeCanvas);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [active, map]);

  return null;
}
