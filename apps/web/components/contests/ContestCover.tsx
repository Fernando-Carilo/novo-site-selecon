import Image from "next/image";
import type { ContestArea, ContestCover as ContestCoverData } from "@/lib/content/types";

interface ContestCoverProps {
  cover: ContestCoverData;
  /** Nome curto do órgão exibido na arte (ex.: "CEFET/RJ"). */
  label: string;
  uf: string;
  /** `hero` aumenta a escala do grafismo para o destaque da home. */
  size?: "card" | "hero";
  className?: string;
  /** Prioriza o carregamento da foto (LCP) quando houver `imageUrl`. */
  priority?: boolean;
  /** Oculta o selo e o rótulo (quando o contêiner já mostra essas informações). */
  plain?: boolean;
}

interface AreaArt {
  from: string;
  to: string;
  accent: string;
  icon: string;
  name: string;
}

/**
 * Paleta por área temática — sempre dentro da identidade (navy, azul, ciano), com o ícone
 * e o nome da área escritos: a cor é a terceira camada de leitura, nunca a única.
 */
const AREA_ART: Record<ContestArea, AreaArt> = {
  SEGURANCA: {
    from: "#071B3D",
    to: "#0B2D60",
    accent: "#23B5E8",
    name: "Segurança pública",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4",
  },
  SAUDE: {
    from: "#0B2D60",
    to: "#0B66D4",
    accent: "#5EE0B4",
    name: "Saúde",
    icon: "M19.5 12.57 12 20l-7.5-7.43A5 5 0 1 1 12 6.01a5 5 0 1 1 7.5 6.56ZM3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27",
  },
  EDUCACAO: {
    from: "#0B66D4",
    to: "#23B5E8",
    accent: "#FFFFFF",
    name: "Educação",
    icon: "M22 10 12 5 2 10l10 5 10-5Zm-16 2.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5M22 10v6",
  },
  ADMINISTRACAO: {
    from: "#0B2D60",
    to: "#1757B0",
    accent: "#23B5E8",
    name: "Administração e gestão",
    icon: "M3 22h18M6 18v-7m4 7v-7m4 7v-7m4 7v-7M2 11l10-7 10 7H2Z",
  },
  ENGENHARIA: {
    from: "#071B3D",
    to: "#1E3F6E",
    accent: "#23B5E8",
    name: "Engenharia e indústria",
    icon: "M12 22V8m0-6a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 12H2a10 10 0 0 0 20 0h-3",
  },
  LEGISLATIVO: {
    from: "#0B2D60",
    to: "#071B3D",
    accent: "#E2503F",
    name: "Poder Legislativo",
    icon: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Zm-14 0 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1ZM7 21h10M12 3v18m-9-14h18",
  },
  TECNICO: {
    from: "#1491C7",
    to: "#0B66D4",
    accent: "#FFFFFF",
    name: "Ensino técnico",
    icon: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z",
  },
  JURIDICO: {
    from: "#071B3D",
    to: "#0B2D60",
    accent: "#23B5E8",
    name: "Jurídico e controle",
    icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M16 13H8m8 4H8",
  },
};

export function areaName(area: ContestArea): string {
  return AREA_ART[area].name;
}

/**
 * Capa vetorial de alta qualidade (SVG, nítida em qualquer densidade de pixels): gradiente
 * institucional, grafismo em chevrons derivado do "S" da marca, ícone da área e selo do
 * órgão/UF. Quando a Central fornece uma foto oficial (`imageUrl`), ela é usada por cima.
 */
export function ContestCover({
  cover,
  label,
  uf,
  size = "card",
  className = "",
  priority = false,
  plain = false,
}: ContestCoverProps) {
  const art = AREA_ART[cover.area];
  const gradientId = `cover-${cover.area.toLowerCase()}-${size}`;
  const hero = size === "hero";

  return (
    <div className={`bg-navy-primary relative overflow-hidden ${className}`}>
      {cover.imageUrl ? (
        <Image
          src={cover.imageUrl}
          alt={cover.imageAlt ?? ""}
          fill
          priority={priority}
          sizes={hero ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={art.from} />
              <stop offset="100%" stopColor={art.to} />
            </linearGradient>
            <linearGradient id={`${gradientId}-glow`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={art.accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={art.accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="800" height="450" fill={`url(#${gradientId})`} />
          <g opacity="0.16" fill="#FFFFFF">
            <path d="M520 40 L700 40 L640 130 L460 130 Z" />
            <path d="M460 130 L640 130 L580 220 L400 220 Z" />
            <path d="M400 220 L580 220 L520 310 L340 310 Z" />
            <path d="M340 310 L520 310 L460 400 L280 400 Z" />
          </g>
          <g opacity="0.1" fill="#FFFFFF">
            <path d="M620 -20 L800 -20 L740 70 L560 70 Z" />
            <path d="M560 70 L740 70 L680 160 L500 160 Z" />
            <path d="M700 250 L880 250 L820 340 L640 340 Z" />
            <path d="M640 340 L820 340 L760 430 L580 430 Z" />
          </g>
          <rect
            x="0"
            y="0"
            width="520"
            height="450"
            fill={`url(#${gradientId}-glow)`}
            opacity="0.35"
          />
          <circle cx="110" cy="360" r="190" fill="#FFFFFF" opacity="0.05" />
          <g
            transform={hero ? "translate(560 210) scale(7.5)" : "translate(600 230) scale(6)"}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          >
            <path d={art.icon} transform="translate(-12 -12)" />
          </g>
        </svg>
      )}
      {plain ? null : (
        <>
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="text-navy-primary shadow-low rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold uppercase tracking-wide">
              {uf}
            </span>
            <span className="bg-navy-primary/70 hidden rounded-md px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:inline">
              {art.name}
            </span>
          </div>
          <p className="absolute bottom-4 left-4 right-4 line-clamp-2 text-sm font-bold text-white drop-shadow-sm sm:text-base">
            {label}
          </p>
        </>
      )}
    </div>
  );
}
