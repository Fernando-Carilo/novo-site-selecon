# Plano de Migração

Referência: seção 14 do prompt mestre. Nenhuma migração real de dados foi executada nesta
sessão — este documento descreve o **plano**, a ser executado nas Fases 2 (conteúdo/CMS),
5 (atendimento) e 6 (denúncias), e consolidado na Fase 9 (go-live).

## 1. Princípios

- Migração gradual, mensurável e reversível.
- Nenhum portal legado (`selecon.org.br`, `atendimento.selecon.org.br`,
  `denuncias.selecon.org.br`) é desligado antes de validar paridade funcional, dados, SEO e
  operação.
- Nenhum dado real é copiado para este repositório em nenhuma fase (seeds são sempre
  fictícios).

## 2. Inventário (a executar na Fase 2)

Um crawler/importador controlado mapeará, a partir de acesso autorizado ao WordPress e aos
sistemas de atendimento/denúncias:

- páginas, posts, categorias, mídia, menus, redirects e metadados SEO do `selecon.org.br`;
- schema e dados operacionais de `atendimento.selecon.org.br` (tickets, mensagens, anexos,
  base de conhecimento, auditoria);
- schema e dados operacionais de `denuncias.selecon.org.br` (o mais sensível — ver seção 4).

Saída esperada: `docs/migration/content-inventory.csv` + relatório de qualidade (a gerar
quando houver acesso real aos sistemas de origem — **não é possível gerar nesta fase sem
acesso/credenciais**).

## 3. WordPress (institucional) — fluxo planejado

1. Exportar conteúdo e mídia via API/export oficial;
2. normalizar encoding, HTML e links;
3. sanitizar conteúdo (proteção contra XSS embutido em posts antigos);
4. mapear para o novo modelo (`ContentPage`, `NewsPost`, `MediaAsset`, etc.);
5. importar em ambiente de staging;
6. validar amostra e contagem total;
7. preservar datas e autores originais quando possível;
8. gerar mapa de redirects 301 (URLs legadas → novas);
9. rodar link checker;
10. comparar SEO/sitemap antes e depois;
11. congelar conteúdo do legado antes do corte final;
12. executar delta final e cutover de DNS/roteamento;
13. monitorar erros pós-corte com rollback disponível.

## 4. Atendimento existente — fluxo planejado

Antes de qualquer migração: documentar schema/regras atuais, backup verificável, mapear
usuários/tickets/mensagens/anexos/status/motivos/base de conhecimento/auditoria, preservar
IDs legados em campo próprio, anonimizar em ambiente não produtivo, importação idempotente,
validação de contagens/checksums/amostras, parallel run de e-mail/WhatsApp, prevenção de
duplicidade, teste de rollback.

Enquanto o sistema atual continuar operando, qualquer integração será por API ou sincronização
unidirecional **documentada** — nunca escrita simultânea em dois sistemas sem estratégia de
consistência definida.

## 5. Canal de denúncias existente — fluxo mais sensível

Antes de qualquer ação: autorização formal, backup criptografado, acesso restrito ao pacote de
migração, cadeia de custódia documentada, mapeamento de protocolo/hash/status/mensagens/
anexos/usuários/auditoria, validação de compatibilidade do método de autenticação (nunca
reemitir códigos nem enfraquecer hashes), ensaio isolado com dados anonimizados, validação
com integridade/jurídico, rollback definido, apagamento seguro de artefatos temporários após
aceite formal.

**Esta migração não será iniciada sem autorização explícita e específica do solicitante**,
conforme regra 3.12 e seção 21.8 do prompt mestre.

## 6. Estratégia de cutover (visão geral)

1. Novo portal em homologação;
2. conteúdo institucional em paralelo;
3. catálogo e páginas de edital;
4. redirecionamento gradual de navegação;
5. atendimento em piloto por fila/canal;
6. denúncias somente após homologação de segurança específica;
7. migração final e redirects;
8. janela de observação;
9. desligamento controlado dos legados;
10. retenção de backup e plano de recuperação.

## 7. Status atual

Nenhuma etapa de migração foi iniciada. Esta fase depende de acesso autorizado aos sistemas
de origem, que não foi fornecido nesta sessão.
