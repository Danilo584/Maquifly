/**
 * Inserta datos estructurados en la página.
 * Se usa `dangerouslySetInnerHTML` porque el contenido es JSON generado por
 * la propia aplicación (nunca entrada del usuario sin validar), y se escapan
 * los caracteres que podrían cerrar la etiqueta <script>.
 */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
