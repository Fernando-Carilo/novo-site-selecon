"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function animate() {
      const { gsap } = await import("gsap");
      if (!heroRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-kicker]", { opacity: 0, y: 20, duration: 0.6, delay: 0.2 })
        .from("[data-hero-title]", { opacity: 0, y: 40, duration: 0.8 }, "-=0.3")
        .from("[data-hero-desc]", { opacity: 0, y: 30, duration: 0.7 }, "-=0.4")
        .from("[data-hero-cta]", { opacity: 0, y: 20, stagger: 0.12, duration: 0.6 }, "-=0.3")
        .from("[data-hero-glow]", { opacity: 0, scale: 0.5, duration: 1.5, ease: "power2.out" }, "-=1")
        .from("[data-hero-particles]", { opacity: 0, duration: 2 }, "-=1");
    }
    animate();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[85vh] overflow-hidden bg-[#040d18]"
      aria-label="Apresentação do Instituto Selecon"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#040d18] via-[#071e3a] to-[#0a2e52]" />

      {/* Glow orbs */}
      <div data-hero-glow className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[600px] rounded-full bg-gradient-radial from-green/20 via-green/5 to-transparent blur-3xl animate-pulse" />
      </div>
      <div data-hero-glow className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-blue-700/10 blur-3xl" />
      <div data-hero-glow className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-green/10 blur-3xl" />

      {/* Floating particles (CSS only for now) */}
      <div data-hero-particles className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Content */}
      <div className="relative z-10 flex min-h-[85vh] items-center">
        <div className="w-[min(1200px,calc(100%-40px))] mx-auto py-20 text-center">
          <p data-hero-kicker className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-1.5 text-[12px] font-bold uppercase tracking-widest text-green">
            <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
            Instituto Nacional de Seleções e Concursos
          </p>

          <h1 data-hero-title className="mx-auto mt-8 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[4rem]">
            Excelência em{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-green via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                concursos públicos
              </span>
              <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-green/80 to-teal-300/40" />
            </span>{" "}
            e processos seletivos
          </h1>

          <p data-hero-desc className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Transparência, segurança e inovação na organização de concursos, processos
            seletivos e avaliações educacionais para órgãos públicos em todo o Brasil.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              data-hero-cta
              href="/concursos"
              className="group relative min-h-[52px] overflow-hidden rounded-lg bg-green px-7 font-bold text-sm inline-flex items-center text-white shadow-[0_20px_40px_rgba(0,167,131,0.3)] transition-all duration-300 hover:shadow-[0_25px_50px_rgba(0,167,131,0.4)] hover:-translate-y-0.5"
            >
              <span className="relative z-10">Ver concursos abertos</span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-700 to-green opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              data-hero-cta
              href="/institucional"
              className="min-h-[52px] rounded-lg border border-white/20 bg-white/5 px-7 font-bold text-sm inline-flex items-center text-white/90 backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:-translate-y-0.5"
            >
              Conheça o Instituto
            </Link>
            <Link
              data-hero-cta
              href="/contato"
              className="min-h-[52px] rounded-lg border border-white/10 bg-white/[0.03] px-7 font-bold text-sm inline-flex items-center text-white/70 transition-all duration-300 hover:border-white/20 hover:text-white hover:-translate-y-0.5"
            >
              Fale conosco
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green/60" /> 265+ concursos realizados</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green/60" /> 1.2M+ candidatos</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green/60" /> 180+ municípios</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green/60" /> 50+ órgãos atendidos</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f5f8fa] to-transparent" />

      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0) translateX(0); opacity: 0.2; }
          to { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
        }
      `}</style>
    </section>
  );
}
