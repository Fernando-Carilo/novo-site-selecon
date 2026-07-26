/**
 * Nomes de fila centralizados. Filas reais de integração (Graph, WhatsApp, antivírus,
 * notificações) serão adicionadas incrementalmente a partir da Fase 4+, conforme cada
 * adapter real for implementado.
 */
export const QUEUE_NAMES = {
  example: "example",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
