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
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
      if (simRef.current) {
        simRef.current.resize(rect.width, rect.height);
      } else {
        simRef.current = new SwarmSimulation(rect.width, rect.height);
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(() => updateDimensions());
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (!simRef.current) return;
    if (active) {
      simRef.current.start();
      if (currentFile) {
        simRef.current.triggerBuildStep(currentFile);
      }
    } else {
      simRef.current.stop();
    }
  }, [active, currentFile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (simRef.current && (active || simRef.current.active)) {
        simRef.current.update();

        ctx.save();
        ctx.scale(dpr, dpr);

        simRef.current.boids.forEach(boid => {
          // 1. Draw Bounding Box if active
          if (boid.box && boid.boxProgress > 0) {
            ctx.save();
            ctx.strokeStyle = boid.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(
              boid.box.x,
              boid.box.y,
              boid.box.w * boid.boxProgress,
              boid.box.h * boid.boxProgress
            );
            ctx.restore();
          }

          // 2. Draw Figma-Style Cursor Arrow
          ctx.save();
          ctx.translate(boid.x, boid.y);

          // Draw Cursor Shadow
          ctx.shadowColor = 'rgba(0,0,0,0.45)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;

          // SVG Cursor shape path
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 15);
          ctx.lineTo(4, 11);
          ctx.lineTo(8, 18);
          ctx.lineTo(11, 16);
          ctx.lineTo(7, 9);
          ctx.lineTo(13, 9);
          ctx.closePath();

          ctx.fillStyle = boid.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();

          // 3. Draw Agent Name & Activity Pill Badge
          ctx.save();
          const badgeX = boid.x + 14;
          const badgeY = boid.y + 12;
          const text = `${boid.name}: ${boid.actionLabel}`;
          ctx.font = '600 11px system-ui, -apple-system, sans-serif';
          const textWidth = ctx.measureText(text).width;
          const badgeWidth = textWidth + 16;
          const badgeHeight = 22;

          // Rounded pill background
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 11);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fillStyle = boid.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, badgeX + 8, badgeY + 15);

          // Blinking caret
          if (boid.caretBlink < 30) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(badgeX + 8 + textWidth + 2, badgeY + 6, 2, 10);
          }

          ctx.restore();
        });

        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 50
      }}
      className={className}
    />
  );
}

export default SwarmRebuildOverlay;

