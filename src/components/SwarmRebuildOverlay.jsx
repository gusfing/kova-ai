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
          // 1. Draw Bounding Wireframe Box & Selection Handles
          if (boid.box && (boid.state === 'selecting' || boid.state === 'editing' || boid.state === 'completed')) {
            ctx.save();
            const bx = boid.box.x;
            const by = boid.box.y;
            const bw = boid.box.w;
            const bh = boid.box.h;

            // Semi-transparent element highlight
            ctx.fillStyle = boid.state === 'completed' ? 'rgba(16, 185, 129, 0.12)' : `${boid.color}14`;
            ctx.fillRect(bx, by, bw, bh);

            // Dashed outline
            ctx.strokeStyle = boid.state === 'completed' ? '#10b981' : boid.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash(boid.state === 'completed' ? [] : [5, 4]);
            ctx.strokeRect(bx, by, bw, bh);

            // Corner handles
            const handleSize = 5;
            ctx.fillStyle = boid.state === 'completed' ? '#10b981' : boid.color;
            ctx.fillRect(bx - 2, by - 2, handleSize, handleSize);
            ctx.fillRect(bx + bw - 3, by - 2, handleSize, handleSize);
            ctx.fillRect(bx - 2, by + bh - 3, handleSize, handleSize);
            ctx.fillRect(bx + bw - 3, by + bh - 3, handleSize, handleSize);

            // Element dimension badge on top of box
            ctx.setLineDash([]);
            ctx.font = '600 9px monospace';
            const dimText = `${boid.targetElem?.label || 'Component'} • ${Math.round(bw)}×${Math.round(bh)}px`;
            const dimWidth = ctx.measureText(dimText).width + 8;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(bx, by - 16, dimWidth, 14);
            ctx.fillStyle = boid.color;
            ctx.fillText(dimText, bx + 4, by - 5);

            // Progress bar at bottom of box during active editing
            if (boid.state === 'editing') {
              const pW = bw * (boid.editProgress / 100);
              ctx.fillStyle = `${boid.color}40`;
              ctx.fillRect(bx, by + bh - 3, bw, 3);
              ctx.fillStyle = boid.color;
              ctx.fillRect(bx, by + bh - 3, pW, 3);
            }

            ctx.restore();
          }

          // 2. Click Ripple Effect
          if (boid.clickRipple > 0) {
            ctx.save();
            ctx.beginPath();
            const rRadius = (1 - boid.clickRipple) * 28 + 6;
            ctx.arc(boid.x, boid.y, rRadius, 0, Math.PI * 2);
            ctx.strokeStyle = boid.color;
            ctx.lineWidth = 2 * boid.clickRipple;
            ctx.globalAlpha = boid.clickRipple;
            ctx.stroke();
            ctx.restore();
          }

          // 3. Draw Figma-Style Cursor Arrow
          ctx.save();
          ctx.translate(boid.x, boid.y);

          // Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
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

          // 4. Draw Agent Task Pill Badge
          ctx.save();
          const badgeX = boid.x + 14;
          const badgeY = boid.y + 12;

          let badgeText = `${boid.name}: ${boid.actionLabel}`;
          if (boid.state === 'editing') {
            badgeText = `${boid.name} (${boid.editProgress}%): ${boid.currentTask}`;
          } else if (boid.state === 'completed') {
            badgeText = `${boid.name}: ✓ Applied Changes`;
          }

          ctx.font = '600 11px system-ui, -apple-system, sans-serif';
          const textMetrics = ctx.measureText(badgeText);
          const badgeWidth = textMetrics.width + 18;
          const badgeHeight = 22;

          // Pill Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetY = 2;

          // Rounded Pill Background
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
          } else {
            ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
          }
          ctx.fillStyle = boid.state === 'completed' ? '#059669' : boid.color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Text with Crisp White
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(badgeText, badgeX + 8, badgeY + 15);

          // Blinking caret
          if (boid.caretBlink < 26 && boid.state === 'editing') {
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
