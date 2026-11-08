import React, { useEffect, useRef } from 'react';
import { SwarmSimulation } from '../lib/swarmPhysics';

export function SwarmRebuildOverlay({ active = false, currentFile = null, className = '' }) {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const animIdRef = useRef(null);

  // Initialize and size canvas
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
        if (currentFile) {
          simRef.current.triggerBuildStep(currentFile);
        }
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

  // React to active / currentFile state changes
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
          // 1. Draw Bounding Wireframe Box
          if (boid.box && boid.boxProgress > 0) {
            ctx.save();
            ctx.strokeStyle = boid.color;
            ctx.fillStyle = `${boid.color}15`; // 8% opacity tint
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 4]);

            const bw = boid.box.w * boid.boxProgress;
            const bh = boid.box.h * boid.boxProgress;

            ctx.fillRect(boid.box.x, boid.box.y, bw, bh);
            ctx.strokeRect(boid.box.x, boid.box.y, bw, bh);

            // Corner handles
            ctx.fillStyle = boid.color;
            ctx.fillRect(boid.box.x - 2, boid.box.y - 2, 5, 5);
            ctx.fillRect(boid.box.x + bw - 3, boid.box.y - 2, 5, 5);
            ctx.fillRect(boid.box.x - 2, boid.box.y + bh - 3, 5, 5);
            ctx.fillRect(boid.box.x + bw - 3, boid.box.y + bh - 3, 5, 5);
            ctx.restore();
          }

          // 2. Draw Figma-Style Cursor Arrow
          ctx.save();
          ctx.translate(boid.x, boid.y);

          // Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 3;

          // Pointer Path
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 16);
          ctx.lineTo(4.5, 12);
          ctx.lineTo(8.5, 19);
          ctx.lineTo(11.5, 17);
          ctx.lineTo(7.5, 10);
          ctx.lineTo(13.5, 10);
          ctx.closePath();

          ctx.fillStyle = boid.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();

          // 3. Draw Agent Badge with Name and Action
          ctx.save();
          const badgeX = boid.x + 14;
          const badgeY = boid.y + 12;
          const text = `${boid.name}: ${boid.actionLabel}`;

          ctx.font = '600 11px system-ui, -apple-system, sans-serif';
          const textMetrics = ctx.measureText(text);
          const badgeWidth = textMetrics.width + 18;
          const badgeHeight = 22;

          // Pill Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;

          // Rounded Pill Background
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fillStyle = boid.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text with Crisp White
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(text, badgeX + 8, badgeY + 15);

          // Blinking caret
          if (boid.caretBlink < 32) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(badgeX + 8 + textMetrics.width + 2, badgeY + 6, 2, 11);
          }

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
