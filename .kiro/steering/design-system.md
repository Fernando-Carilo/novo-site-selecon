---
inclusion: fileMatch
fileMatchPattern: "**/*.tsx,**/*.css,**/tailwind*,**/tokens*"
---

# Design System — Instituto Selecon

## Paleta de Cores (atualizada para interface premium)

O novo design segue referências de Stripe, Vercel e Linear com um toque institucional.

### Cores Primárias
- `--ink` (#081520): texto principal, backgrounds escuros
- `--green` (#00a783): ação primária, CTAs, destaques positivos
- `--green-700` (#007a61): hover de CTAs
- `--blue-950` (#051928): header, footer, seções escuras
- `--blue-800` (#073a63): gradientes, elementos de destaque

### Cores de Suporte
- `--muted` (#617080): texto secundário
- `--soft` (#f5f8fa): backgrounds leves
- `--line` (#dce6ea): bordas, separadores
- `--white` (#ffffff): superfícies
- `--yellow` (#f4bd4f): alertas
- `--red` (#c84f4f): erros, danger

### Gradientes Institucionais
- Hero: `linear-gradient(115deg, rgba(5,25,40,.98), rgba(7,58,99,.92) 54%, rgba(0,167,131,.72))`
- Footer: mesma do hero
- Marca: `linear-gradient(135deg, var(--blue-800), var(--green))`

## Tipografia

- Font family: Inter (sans-serif)
- Headings: font-weight 860+, letter-spacing 0, line-height ~0.96-1.03
- Body: 14-19px, line-height 1.5
- Labels/kickers: 12-13px, font-weight 900, uppercase

## Espaçamento e Layout

- Max-width: 1200px
- Padding lateral: 20px (mobile) / auto com min(max, calc(100% - 40px))
- Seções: padding 92px 0 (desktop) / 68px 0 (mobile)
- Gap padrão: 12-18px entre cards

## Componentes Visuais

- Border-radius padrão: 8px
- Sombras: `0 24px 70px rgba(8,21,32,.12)` (cards elevados)
- Hover em cards: translateY(-4px) + border-color com green
- Botões: min-height 44px, padding 0 18px, font-weight 820
- Glassmorphism: backdrop-filter blur(18px) no header sticky
- Badges: border-radius 999px (pill), font-weight 900

## Grid Patterns

- Hero: 2 colunas (0.95fr / 1.05fr)
- Módulos: 4 colunas com gap 1px (cria efeito de grid com background)
- Perfis: 5 colunas
- Provas: 4 colunas
- Mobile: colapsa para 1-2 colunas

## Animações

- Hover: transform translateY(-2px/-4px), transition 180ms ease
- Entrada: @keyframes rise (opacity 0→1, translateY 24px→0, scale .985→1)
- @media (prefers-reduced-motion: reduce): desativa todas

## Acessibilidade

- Skip link presente
- aria-label em seções e navegação
- Contraste mínimo 4.5:1 (WCAG AA)
- Focus rings visíveis
- Não depender só de cor para informação

## Regras ao Criar Componentes

1. NUNCA hardcode cores — sempre use variáveis CSS ou classes Tailwind mapeadas
2. Componentes devem ser responsivos por padrão (mobile-first)
3. Usar `role` e `aria-*` onde necessário
4. Transições suaves, nunca abruptas
5. Manter consistência com o Design System (@selecon/ui)
6. Preferir composição sobre herança de estilos
