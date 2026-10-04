/**
 * Botão flutuante de WhatsApp — só aparece com SITE_WHATSAPP_NUMBER definido no ambiente
 * de execução (DDI+DDD+número, só dígitos, ex.: 5521XXXXXXXXX). Abre o número oficial.
 */
export function WhatsAppButton() {
  const number = (process.env.SITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (!number) return null;
  const text = encodeURIComponent("Olá! Tenho uma dúvida sobre um concurso do Instituto Selecon.");
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o Instituto Selecon pelo WhatsApp (abre em nova aba)"
      // Canto inferior esquerdo: o direito é do chat da Central (widget), para os dois não se sobreporem.
      className="bg-success-green shadow-high hover:shadow-medium focus-visible:ring-action-blue fixed bottom-5 left-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0 print:hidden"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.3.7 4.6 1.9 6.5L4 29l7.8-2c1.9 1 3.9 1.5 6.1 1.5 6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.7c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-4.6 1.2 1.2-4.4-.2-.4c-1.1-1.7-1.7-3.6-1.7-5.5C5 9.5 9.9 4.8 16 4.8s11 4.7 11 10.1c0 5.5-4.9 9.8-11 9.8zm5.9-7.3c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2.1-.4 0-.6-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z" />
      </svg>
    </a>
  );
}
