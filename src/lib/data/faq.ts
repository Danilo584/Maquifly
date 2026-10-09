export type FaqItem = { question: string; answer: string };

/**
 * Preguntas frecuentes. Se usan en /como-funciona, en la home y como
 * datos estructurados FAQPage. Un único origen para que el texto que ve el
 * usuario y el que lee Google no se desincronicen nunca.
 */
export const faq: FaqItem[] = [
  {
    question: "¿Qué es MaquiFly?",
    answer:
      "MaquiFly es una plataforma que conecta a propietarios de maquinaria con personas y empresas que necesitan alquilarla. Reúne en un solo lugar equipos disponibles, con sus características, ubicación y condiciones, para que puedas comparar y contactar directamente al propietario.",
  },
  {
    question: "¿MaquiFly es dueño de las máquinas?",
    answer:
      "No. Las máquinas pertenecen a los propietarios que las publican: empresas de alquiler, contratistas y particulares. MaquiFly no alquila maquinaria propia, no participa en el contrato entre las partes y no interviene en el pago.",
  },
  {
    question: "¿Cómo puedo alquilar una máquina?",
    answer:
      "Busca el equipo por categoría o por nombre, filtra por ciudad y por las condiciones que necesites (con operador, con transporte, disponible), entra a la publicación para revisar características y condiciones, y contacta al propietario por WhatsApp. El precio final y las condiciones se acuerdan directamente con él.",
  },
  {
    question: "¿Cómo publico mi maquinaria?",
    answer:
      "Desde el botón «Publicar maquinaria» completas un formulario con la categoría, marca, modelo, ubicación, condiciones de alquiler y fotografías. Antes de publicar ves una vista previa exacta de cómo quedará tu anuncio.",
  },
  {
    question: "¿Cuánto cuesta publicar?",
    answer:
      "Publicar es gratuito con el plan Fly Start (hasta 2 máquinas). Quien quiera más alcance puede elegir Fly Plus o Fly Pro, o un Destacado Express para una sola máquina. Son opcionales y nunca se cobra de forma retroactiva por una publicación que se hizo gratis.",
  },
  {
    question: "¿Quién establece el precio?",
    answer:
      "El propietario. Puede mostrar una tarifa por hora, día, semana, mes o viaje, o dejarlo en «Consultar precio» cuando depende del trabajo. MaquiFly no fija precios ni cobra comisión sobre el alquiler en esta etapa.",
  },
  {
    question: "¿Cómo contacto al propietario?",
    answer:
      "Cada publicación tiene un botón de WhatsApp que abre una conversación con un mensaje ya redactado, incluyendo el nombre de la máquina, su ubicación y el código de la publicación, para que el propietario sepa de inmediato de qué equipo le hablas.",
  },
  {
    question: "¿Puedo alquilar con operador?",
    answer:
      "Depende de cada publicación. En la ficha se indica si el propietario ofrece operador y si está incluido en el precio o se cobra aparte. También puedes filtrar la búsqueda para ver solo equipos con operador disponible.",
  },
  {
    question: "¿Puedo solicitar transporte?",
    answer:
      "Muchos propietarios ofrecen traslado de la máquina hasta la obra. La ficha indica si hay transporte disponible y si está incluido en el precio. Es uno de los filtros de búsqueda, porque en maquinaria pesada el traslado puede pesar tanto como la tarifa por hora.",
  },
  {
    question: "¿Cómo funcionan las reseñas?",
    answer:
      "Las reseñas las dejan usuarios que contactaron a un propietario a través de MaquiFly, y califican estado del equipo, puntualidad, comunicación y cumplimiento. No publicamos reseñas inventadas ni de relleno: mientras una máquina no tenga calificaciones reales, su ficha dice exactamente eso.",
  },
  {
    question: "¿Cómo se verifica un propietario?",
    answer:
      "Hay tres niveles. «Propietario registrado» significa únicamente que la cuenta existe. «Propietario verificado» significa que MaquiFly contrastó sus datos de identidad o de empresa y validó su número de contacto. «Documentación revisada» se aplica a una máquina concreta cuyos documentos fueron revisados. No mostramos ninguna insignia si la verificación no se hizo.",
  },
  {
    question: "¿Qué hago si una publicación tiene información falsa?",
    answer:
      "Cada publicación tiene la opción «Reportar publicación», con motivos como información falsa, precio incorrecto, máquina no disponible o posible estafa. Los reportes se revisan y pueden llevar a ocultar la publicación.",
  },
];

/** Subconjunto para la home: las que responden la duda de primera visita. */
export const homeFaqSlugs = [0, 1, 4, 6, 9];
export const homeFaq = homeFaqSlugs.map((i) => faq[i]);
