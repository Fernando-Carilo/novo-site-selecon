"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
}

/**
 * Wrapper component that animates children on scroll using GSAP.
 * Lazy-loads GSAP to avoid bundle bloat for SSR.
 */
export function AnimatedSection({ children, className = "", delay = 0, direction = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let ctx: any;

    async function animate() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const from: Record<string, any> = { opacity: 0, duration: 1, ease: "power3.out", delay };
      if (direction === "up") from.y = 50;
      if (direction === "down") from.y = -50;
      if (direction === "left") from.x = -50;
      if (direction === "right") from.x = 50;
      if (direction === "scale") { from.scale = 0.92; from.y = 30; }

      ctx = gsap.context(() => {
        gsap.from(ref.current!, {
          ...from,
          scrollTrigger: {
            trigger: ref.current!,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });
    }

    animate();
    return () => ctx?.revert?.();
  }, [delay, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
