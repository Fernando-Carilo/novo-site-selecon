/**
 * Corpo de notícia/página vindo da Selecon Central.
 *
 * TEXT (digitado na Central): parágrafos separados por linha em branco.
 * HTML (importado do site antigo): já sanitizado no servidor da Central
 * (sem script/style/iframe/form, sem atributos on*, sem javascript:), por
 * isso pode ser injetado como HTML.
 */
export function PublicationBody({ body, format }: { body: string; format?: "TEXT" | "HTML" | null }) {
  if (format === "HTML") {
    return (
      <div
        className="text-text-primary prose-publication mt-6 text-base leading-relaxed [&_a]:text-action-blue [&_a]:underline [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-5 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:my-3 [&_table]:my-4 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_ul]:my-3 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }
  return <div className="text-text-primary mt-6 whitespace-pre-wrap text-base leading-relaxed">{body}</div>;
}
