/**
 * Corpo de notícia/página vindo da Selecon Central.
 * TEXT: parágrafos digitados na Central (linha em branco separa parágrafos).
 * HTML: importado do site antigo ou gerado a partir do certame — já sanitizado
 * no servidor da Central (sem script/style/iframe/form, sem on*, sem javascript:).
 */
export function PublicationBody({
  body,
  format,
}: {
  body: string;
  format?: "TEXT" | "HTML" | null;
}) {
  if (format === "HTML") {
    return (
      <div
        className="text-text-primary [&_a]:text-action-blue [&_blockquote]:border-border [&_h2]:text-navy-primary [&_h3]:text-navy-primary [&_td]:border-border [&_th]:border-border [&_th]:bg-background-light mt-8 text-base leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_table]:my-6 [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:text-left [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }
  return (
    <div className="text-text-primary mt-8 space-y-4 text-base leading-relaxed">
      {body.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
