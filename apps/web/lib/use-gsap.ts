"use client";

import { useEffect, useRef } from "react";

/**
 * Hook for GSAP scroll-triggered fade-in animations.
 * Applies to all children with [data-animate] attribute.
 */
export function useScrollAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsapModule: typeof import("gsap") | null = null;

    async function init() {
      gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsapModule.gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      const elements = containerRef.current.querySelectorAll("[data-animate]");
      elements.forEach((el, i) => {
        const direction = el.getAttribute("data-animate") || "up";
        const delay = parseFloat(el.getAttribute("data-delay") || "0");

        const from: Record<string, number | string> = {
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        };

        if (direction === "up") from.y = 60;
        if (direction === "down") from.y = -60;
        if (direction === "left") from.x = -60;
        if (direction === "right") from.x = 60;
        if (direction === "scale") { from.scale = 0.9; from.y = 30; }

        gsapModule!.gsap.from(el, {
          ...from,
          delay: delay || i * 0.1,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    }

    init();

    return () => {
      if (gsapModule) {
        const { ScrollTrigger } = gsapModule.gsap.plugins as any;
        if (ScrollTrigger?.getAll) {
          ScrollTrigger.getAll().forEach((t: any) => t.kill());
        }
      }
    };
  }, []);

  return containerRef;
}
