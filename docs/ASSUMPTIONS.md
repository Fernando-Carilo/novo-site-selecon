# Premissas Adotadas

Este documento registra premissas adotadas para permitir avanço contínuo do trabalho,
conforme a regra 3.12 do prompt mestre: dúvidas menores não interrompem a execução —
são registradas aqui e o trabalho continua.

## 1. Protótipo visual (`selecon-portal-v2.html`) ausente no pacote recebido

**Status: pendência real, não bloqueante para a Fase 0.**

O pacote de anexos recebido nesta sessão contém:

- `PROMPT-MESTRE-CLAUDE-NOVO-SITE-SELECON.md` / `.txt`;
- `README-ENTREGAVEIS.md`;
- `COMANDO-INICIAL-PARA-CLAUDE.txt`.

O `README-ENTREGAVEIS.md` referencia `selecon-portal-v2.html` (16 telas navegáveis) e uma
pasta `previews/` com capturas de tela, mas **nenhum dos dois foi efetivamente enviado**
nesta sessão. Uma busca no sistema de arquivos confirmou a ausência completa do arquivo.

**Premissa adotada:** a Fase 0 (fundação, tooling, monorepo, CI, docker-compose, docs) não
depende do protótipo visual e será executada integralmente agora. A Fase 1 (design system e
shells visuais) e todo trabalho de fidelidade de UI ao protótipo ficam **bloqueados** até que
o arquivo `selecon-portal-v2.html` seja fornecido. Os tokens de design da seção 5.2 do prompt
mestre (cores, tipografia) já foram extraídos textualmente e serão aplicados desde já, pois
não dependem do HTML.

**Ação pendente do solicitante:** anexar `selecon-portal-v2.html` (e, se possível, a pasta
`previews/`) para desbloquear a Fase 1 com fidelidade total ao protótipo aprovado.

## 2. Estado inicial do repositório

O repositório `novo-site-selecon` estava **vazio** (sem nenhum commit) no início desta sessão,
já no branch `claude/new-session-e7n8z6`. Não havia código, README, `package.json` ou histórico
prévio a preservar. Portanto, toda a estrutura de monorepo criada na Fase 0 é nova, sem risco de
sobrescrever trabalho existente.

## 3. Stack técnica

Adotada a stack sugerida na seção 6.1 do prompt mestre sem alterações, pois nenhuma limitação de
ambiente ou preferência do time foi informada. Detalhes e justificativas em `docs/DECISIONS/`.

## 4. Autenticação e SSO

Como não há Identity Provider (Azure AD / OIDC) configurado ou credenciais fornecidas, a Fase 0
usa um **provider de autenticação de desenvolvimento local** (credenciais de seed, sem
integração externa real), com a interface já desenhada para substituição por OIDC real na Fase 1.
Nenhuma integração é declarada como operacional.

## 5. Integrações externas (Microsoft Graph, WhatsApp Cloud API, sistema do candidato)

Nenhuma credencial foi fornecida. Todas as integrações serão implementadas como
interfaces/adapters com implementação mock local, conforme regra 3.10. Nenhuma é declarada como
operacional até teste real com credenciais do Instituto.

## 6. Infraestrutura AWS

Nenhum provisionamento real de recursos AWS será feito nesta fase. `infra/` conterá apenas
código como referência (IaC) e documentação, sem `apply`/`deploy` real, conforme regra 3.12 e
seção 21.8 do prompt mestre — autorização explícita será solicitada antes de qualquer
provisionamento.

## 7. Dados de teste e seeds

Todos os dados de seed (concursos, usuários, tickets, denúncias, campanhas) serão fictícios,
claramente identificados como demo, sem qualquer semelhança com pessoas ou casos reais.

## 8. Conteúdo migrado do site atual sem acesso direto ao WordPress (sessão de 2026-10-05)

O ambiente desta sessão não tinha saída de rede para `selecon.org.br`, `concursos.selecon.org.br`,
`selecon.selecao.net.br` nem para arquivos (Wayback). O conteúdo foi reconstruído a partir de:

- resultados de busca pública (títulos, URLs e resumos das páginas de concurso, 2025–2026);
- a apresentação institucional oficial do Instituto (Google Drive do Instituto): missão, visão,
  valores, estrutura, equipe de direção/coordenação, números de inscritos por certame e
  reconhecimentos;
- o logotipo oficial (arquivo de marca 1280×640) do Drive.

**Premissa:** o dataset em `apps/web/lib/content/data/` é a **carga inicial** e deve ser revisado
pela equipe antes do go-live — em especial datas previstas de etapas futuras (marcadas como
"previsão" na interface) e o status de certames em fase final. A Central de Serviços passa a ser a
fonte de verdade assim que `CONTENT_SOURCE=central` for ativado (ver `docs/CENTRAL_DE_SERVICOS.md`).
Nenhum dado pessoal foi copiado; contatos são apenas os institucionais públicos (PABX, e-mails
`faleconosco@`/`comercial@`, endereço da sede, Instagram e Facebook oficiais).

## 9. Imagens de concursos

Não havia acesso a fotos oficiais nesta sessão. O portal usa **capas vetoriais** (`ContestCover`,
SVG nítido em qualquer densidade) por área temática, sempre com nome do órgão, UF e nome da área
escritos. O modelo já prevê `cover.imageUrl`/`imageAlt` para fotos em alta resolução servidas pela
Central (≥ 1600 px), com `next/image` e `remotePatterns` configurados.

## 10. Publicidade e campanhas

Nenhuma campanha patrocinada existe ainda (Fase 7). A home **não** reserva espaço vazio para
anúncios: o bloco correspondente da seção 9.2 será adicionado quando houver inventário aprovado,
sempre identificado como "Publicidade".

## 11. Canal de denúncias e atendimento legados

O canal de denúncias próprio e segregado é da Fase 6; a página `/integridade` explica o canal e
encaminha para `denuncias.selecon.org.br`. A consulta de protocolo do Fale Conosco responde de
forma honesta no modo mock e orienta ao sistema atual (`atendimento.selecon.org.br`) para
protocolos antigos.

## 12. Equipe institucional

Nomes e cargos da direção e coordenação exibidos em `/instituto` vêm da apresentação institucional
(material de divulgação do Instituto). Contatos pessoais (celulares, e-mails nominais, registros
profissionais) **não** foram publicados. Confirmar com a diretoria a lista a manter no ar.
