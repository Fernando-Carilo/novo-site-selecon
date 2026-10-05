import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  /** `dark` para fundos escuros (rodapé): aplica o logotipo em versão clara. */
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
}

/**
 * Logotipo oficial do Instituto (arquivo da marca, 1280×640). Em fundo escuro usa um
 * contêiner branco para preservar as cores institucionais em vez de recolorir a marca.
 */
export function BrandLogo({ variant = "light", className = "", priority = false }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`focus-visible:ring-action-blue inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-[3px] ${className}`}
      aria-label="Instituto Selecon — página inicial"
    >
      <span className={variant === "dark" ? "rounded-md bg-white px-3 py-2" : ""}>
        <Image
          src="/brand/selecon-logo-1280.png"
          alt="Instituto Selecon — Instituto Nacional de Seleções e Concursos"
          width={180}
          height={90}
          priority={priority}
          className="h-10 w-auto sm:h-12"
        />
      </span>
    </Link>
  );
}
