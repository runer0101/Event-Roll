"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
};

/**
 * Gold dust with a subtle pointer parallax. Adapted from the canvas-particles
 * demo in animacion-lib, rewritten without a runtime dependency.
 *
 * Performance: it starts after the first idle window, stops while the canvas
 * is offscreen or the tab is hidden, and draws fewer particles on phones. With
 * reduced motion it paints a single static field.
 */
export function GoldParticles({
  className = "",
  count = 42,
}: {
  className?: string;
  count?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let ready = false;
    let visible = true;
    const pointer = { x: 0, y: 0 };

    const particleCount = () => {
      if (reduced) return Math.min(count, 24);
      const compact = window.matchMedia("(max-width: 640px)").matches;
      return compact ? Math.min(count, 22) : count;
    };

    const createParticles = () =>
      Array.from({ length: particleCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.35,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(Math.random() * 0.22 + 0.04),
        alpha: Math.random() * 0.5 + 0.14,
        phase: Math.random() * Math.PI * 2,
      }));

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const px = pointer.x * 14;
      const py = pointer.y * 10;

      for (const particle of particles) {
        const drift = Math.sin(particle.phase + performance.now() / 2600) * 6;
        const x = particle.x + drift + px * (particle.radius / 2);
        const y = particle.y + py * (particle.radius / 2);

        context.beginPath();
        context.arc(x, y, particle.radius * 3.2, 0, Math.PI * 2);
        context.fillStyle = `rgba(212, 175, 55, ${particle.alpha * 0.12})`;
        context.fill();

        context.beginPath();
        context.arc(x, y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(246, 227, 161, ${particle.alpha})`;
        context.fill();
      }
    };

    const tick = () => {
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.y < -8) {
          particle.y = height + 8;
          particle.x = Math.random() * width;
        }
        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
      }
      draw();
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!ready || !visible || reduced || document.hidden) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(tick);
    };

    const stop = () => window.cancelAnimationFrame(frame);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles();
      draw();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
      pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "160px" },
    );
    intersection.observe(canvas);

    let idleHandle: number | undefined;
    const begin = () => {
      ready = true;
      start();
    };

    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);

      if (typeof window.requestIdleCallback === "function") {
        idleHandle = window.requestIdleCallback(begin, { timeout: 1200 });
      } else {
        idleHandle = window.setTimeout(begin, 250);
      }
    }

    return () => {
      stop();
      intersection.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (idleHandle !== undefined) {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
