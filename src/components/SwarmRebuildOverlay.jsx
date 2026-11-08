import React, { useEffect, useRef } from 'react';
import { SwarmSimulation } from '../lib/swarmPhysics';

export function SwarmRebuildOverlay({ active = false, currentFile = null, className = '' }) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || canvas.parentElement?.clientWidth || 800;
      const h = rect.height || canvas.parentElement?.clientHeight || 600;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = w * dpr;
      canvas.height = h * dpr;

      if (!simRef.current) {
        simRef.current = new SwarmSimulation(w, h);
      } else {
        simRef.current.resize(w, h);
      }

      if (active) {
        simRef.current.start();
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(canvas.parentElement || canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!simRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas ? canvas.getBoundingClientRect() : { width: 800, height: 600 };
      simRef.current = new SwarmSimulation(rect.width || 800, rect.height || 600);
    }

    if (active) {
      simRef.current.start();
      if (currentFile) {
        simRef.current.triggerBuildStep(currentFile);
      }
    } else {
      simRef.current.stop();
    }
  }, [active, currentFile]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (active && simRef.current) {
        simRef.current.update();

        ctx.save();
        ctx.scale(dpr, dpr);

        simRef.current.boids.forEach(boid => {
          // 1. Subtle selection outline (clean 1px line, NO intrusive background or text)
          if (boid.isSelecting && boid.hoverBox && boid.pauseTicks > 20) {
            ctx.save();
            ctx.strokeStyle = `${boid.color}80`; // 50% opacity
            ctx.lineWidth = 1;
            ctx.strokeRect(boid.hoverBox.x, boid.hoverBox.y, boid.hoverBox.w, boid.hoverBox.h);

            // Subtle corner accents
            ctx.fillStyle = boid.color;
            const s = 4;
            ctx.fillRect(boid.hoverBox.x - 1, boid.hoverBox.y - 1, s, s);
            ctx.fillRect(boid.hoverBox.x + boid.hoverBox.w - 3, boid.hoverBox.y - 1, s, s);
            ctx.fillRect(boid.hoverBox.x - 1, boid.hoverBox.y + boid.hoverBox.h - 3, s, s);
            ctx.fillRect(boid.hoverBox.x + boid.hoverBox.w - 3, boid.hoverBox.y + boid.hoverBox.h - 3, s, s);
            ctx.restore();
          }

          // 2. Figma-style cursor arrow
          ctx.save();
          ctx.translate(boid.x, boid.y);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetY = 2;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 14);
          ctx.lineTo(3.5, 10.5);
          ctx.lineTo(7, 16);
          ctx.lineTo(9.5, 14.5);
          ctx.lineTo(6, 9);
          ctx.lineTo(11, 9);
          ctx.closePath();

          ctx.fillStyle = boid.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // 3. Compact Name Pill (Figma style)
          ctx.save();
          const badgeX = boid.x + 10;
          const badgeY = boid.y + 10;

          ctx.font = '600 10px system-ui, -apple-system, sans-serif';
          const textMetrics = ctx.measureText(boid.name);
          const badgeWidth = textMetrics.width + 12;
          const badgeHeight = 18;

          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 1;

          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fillStyle = boid.color;
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(boid.name, badgeX + 6, badgeY + 12);
          ctx.restore();
        });

        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 99,
        display: active ? 'block' : 'none'
      }}
      className={className}
    />
  );
}

export default SwarmRebuildOverlay;
