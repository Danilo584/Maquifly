import type { BlogPost } from "@/lib/types";

/**
 * CONTENIDO DEL BLOG
 * ---------------------------------------------------------------------------
 * Los artículos responden preguntas que un cliente real se hace antes de
 * alquilar. No se publican cifras de precio inventadas: los precios de
 * maquinaria varían por marca, año, distancia y temporada, y publicar un
 * "precio referencial" ficticio sería exactamente el tipo de dato falso que
 * este proyecto evita. En su lugar, los artículos explican cómo se forma el
 * precio y qué preguntar.
 *
 * En el MVP viven en este archivo. Cuando el volumen lo justifique, se
 * migran a MDX o a un CMS sin cambiar la interfaz de `BlogPost`.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "cuanto-cuesta-alquilar-un-minicargador-en-piura",
    title: "¿Cuánto cuesta alquilar un minicargador en Piura?",
    excerpt:
      "No hay un precio único, y desconfía de quien te dé uno sin preguntar nada. Esto es lo que define la tarifa y cómo pedir una cotización que puedas comparar.",
    publishedAt: "2026-04-08T00:00:00.000Z",
    readingMinutes: 6,
    categorySlugs: ["minicargadores"],
    locationSlug: "piura",
    keywords: [
      "cuánto cuesta alquilar un minicargador",
      "precio alquiler minicargador Piura",
      "tarifa minicargador por hora",
    ],
    body: [
      {
        type: "p",
        text: "Es la primera pregunta de casi todo el mundo, y la respuesta honesta es incómoda: depende. Dos minicargadores del mismo modelo, en la misma semana y en la misma ciudad, pueden costar muy distinto según quién los opere, cuántas horas contrates y a qué distancia esté la obra. Por eso MaquiFly no publica un «precio referencial»: sería un número inventado que solo sirve para decepcionar a alguien.",
      },
      {
        type: "p",
        text: "Lo que sí se puede explicar con precisión es cómo se forma ese precio. Si entiendes las piezas, sabes qué preguntar y puedes comparar dos cotizaciones que, a simple vista, parecen iguales.",
      },
      { type: "h2", text: "Las siete variables que mueven la tarifa" },
      {
        type: "ol",
        items: [
          "Unidad de cobro. Por hora es lo más común en maquinaria pesada; por día conviene cuando el trabajo pasa de seis o siete horas. Una tarifa por hora baja con un mínimo de ocho horas puede salir más cara que una tarifa por día.",
          "Mínimo de contratación. Casi todos los propietarios cobran un mínimo (habitualmente cuatro horas). Si tu trabajo dura dos, vas a pagar el mínimo igual.",
          "Operador. Puede venir incluido o cobrarse aparte. Si viene aparte, pregunta si el costo es por hora o por jornada, porque no es lo mismo.",
          "Traslado. En maquinaria pesada el movimiento de la máquina hasta la obra puede ser una parte enorme del total, sobre todo fuera del casco urbano. Se cotiza por viaje, ida y vuelta.",
          "Combustible. Lo habitual es que lo asuma el cliente. Un minicargador consume varios galones por jornada, así que no es un detalle menor.",
          "Antigüedad y estado. Una máquina reciente y bien mantenida cuesta más por hora, pero rinde más y se malogra menos. Una máquina vieja barata que se detiene media jornada sale carísima.",
          "Temporada. En Piura, la demanda de maquinaria sube en época de obra pública y en campañas agrícolas. Reservar con anticipación cambia el precio.",
        ],
      },
      { type: "h2", text: "Cómo pedir una cotización comparable" },
      {
        type: "p",
        text: "El error más común es escribir «¿cuánto cobras por el minicargador?». Recibes un número suelto que no puedes comparar con nada. Un mensaje que sí sirve incluye cinco datos:",
      },
      {
        type: "ul",
        items: [
          "Qué trabajo se va a hacer y en qué tipo de terreno.",
          "Dónde está la obra: distrito y una referencia.",
          "Cuántas horas o jornadas estimas.",
          "Fechas en las que necesitas la máquina.",
          "Si necesitas operador y si necesitas que la trasladen.",
        ],
      },
      {
        type: "p",
        text: "Con esos datos el propietario puede darte un precio cerrado, y tú puedes poner dos cotizaciones una al lado de la otra sabiendo que incluyen lo mismo. En MaquiFly, el botón de WhatsApp de cada publicación ya arma el mensaje con el nombre de la máquina, su ubicación y el código de la publicación, para que solo tengas que agregar los detalles de tu obra.",
      },
      { type: "h2", text: "La pregunta que casi nadie hace" },
      {
        type: "p",
        text: "¿Qué pasa si la máquina se malogra a media jornada? Acuérdalo antes, no después. Lo razonable es que las horas no trabajadas no se cobren y que el propietario avise si tiene un reemplazo. Ponerlo por escrito en el mismo chat de WhatsApp toma diez segundos y evita discusiones caras.",
      },
      {
        type: "note",
        text: "MaquiFly es una plataforma de conexión: no fija precios ni participa en el acuerdo. El precio lo pone el propietario y lo negocias directamente con él.",
      },
    ],
  },
  {
    slug: "alquilar-maquinaria-con-operador-o-sin-operador",
    title: "¿Alquilar maquinaria con operador o sin operador?",
    excerpt:
      "La decisión no es solo de costo. Afecta al rendimiento por hora, al desgaste del equipo y a quién responde si algo sale mal.",
    publishedAt: "2026-04-15T00:00:00.000Z",
    readingMinutes: 5,
    categorySlugs: ["excavadoras", "minicargadores", "retroexcavadoras"],
    locationSlug: null,
    keywords: [
      "alquilar maquinaria con operador",
      "maquinaria sin operador",
      "operador de maquinaria pesada",
    ],
    body: [
      {
        type: "p",
        text: "En el alquiler de maquinaria pesada, «con operador» es la modalidad más extendida en Perú, y por buenas razones. Pero hay casos en los que alquilar solo el equipo tiene sentido. La diferencia entre acertar y equivocarse suele medirse en horas facturadas de más.",
      },
      { type: "h2", text: "Con operador: qué estás comprando en realidad" },
      {
        type: "p",
        text: "No estás comprando a alguien que mueva palancas. Un operador con experiencia en ese modelo concreto rinde bastante más por hora que uno que recién se acostumbra a la máquina, y ese diferencial se paga solo. Además:",
      },
      {
        type: "ul",
        items: [
          "Conoce los límites del equipo y no lo fuerza, lo que reduce averías a media jornada.",
          "Resuelve el trabajo con menos maniobras, y las maniobras son horas.",
          "La responsabilidad por el uso del equipo queda del lado del propietario, no del tuyo.",
          "Suele venir con su propia experiencia del tipo de suelo de la zona, que en el norte cambia mucho entre arena, arcilla y material de río.",
        ],
      },
      { type: "h2", text: "Sin operador: cuándo tiene sentido" },
      {
        type: "ul",
        items: [
          "Cuando ya tienes operadores en planilla con experiencia en ese tipo de máquina.",
          "En equipos ligeros —plataformas elevadoras, compactadoras, generadores— donde el manejo es simple y el riesgo, bajo.",
          "En alquileres largos, de semanas o meses, donde pagar operador por horas se vuelve caro frente a tener el tuyo.",
        ],
      },
      {
        type: "p",
        text: "Si vas sin operador, el propietario te va a pedir garantías: experiencia demostrable, a veces un depósito y casi siempre un acuerdo claro sobre daños. Es razonable. Estás asumiendo el riesgo de un activo que cuesta decenas de miles de dólares.",
      },
      { type: "h2", text: "Preguntas que conviene hacer en ambos casos" },
      {
        type: "ol",
        items: [
          "¿El operador está incluido en la tarifa o se cobra aparte?",
          "¿Cuántas horas cubre la jornada del operador y qué pasa si se extiende?",
          "¿Quién asume el combustible?",
          "¿Qué ocurre con las horas si la máquina se detiene por avería?",
          "¿Quién responde por daños a terceros durante el trabajo?",
        ],
      },
      {
        type: "p",
        text: "En MaquiFly puedes filtrar la búsqueda para ver solo equipos con operador disponible, y cada ficha indica si el operador está incluido en el precio o se cobra por separado.",
      },
    ],
  },
  {
    slug: "diferencias-entre-excavadora-y-retroexcavadora",
    title: "Excavadora o retroexcavadora: cuál necesita tu obra",
    excerpt:
      "Se parecen en el nombre y en poco más. Elegir mal significa pagar de más por potencia que no usas, o quedarte corto a mitad de obra.",
    publishedAt: "2026-04-22T00:00:00.000Z",
    readingMinutes: 6,
    categorySlugs: ["excavadoras", "retroexcavadoras"],
    locationSlug: null,
    keywords: [
      "diferencia excavadora retroexcavadora",
      "qué máquina usar para excavar",
      "excavadora vs retroexcavadora",
    ],
    body: [
      {
        type: "p",
        text: "La confusión es entendible: ambas excavan y ambas tienen un brazo. Pero son máquinas con lógicas distintas, y la elección correcta depende menos de cuánto vas a excavar que de qué más necesitas hacer mientras excavas.",
      },
      { type: "h2", text: "La excavadora: especialista" },
      {
        type: "p",
        text: "Va sobre orugas, gira 360° sobre sí misma y está diseñada para una sola cosa: excavar mucho y profundo. Su ventaja real es que puede trabajar en un frente sin reposicionarse constantemente, lo que en obras grandes se traduce en menos horas facturadas.",
      },
      {
        type: "ul",
        items: [
          "Mayor profundidad y alcance de excavación.",
          "Mejor estabilidad en terreno blando o irregular.",
          "Acepta implementos hidráulicos: martillo, cizalla, pulverizador.",
          "No se desplaza por vía pública: necesita cama baja, y ese traslado cuesta.",
        ],
      },
      { type: "h2", text: "La retroexcavadora: polivalente" },
      {
        type: "p",
        text: "Va sobre llantas y combina un cargador frontal con un brazo excavador trasero. Es la máquina de las obras pequeñas y medianas, y sobre todo de las obras urbanas: llega sola a la obra, excava la zanja, carga el material y se va.",
      },
      {
        type: "ul",
        items: [
          "Se desplaza por vía pública sin cama baja: ahorra el costo de traslado.",
          "Hace dos trabajos —cargar y excavar— sin alquilar dos equipos.",
          "Menor profundidad y menor volumen por hora que una excavadora.",
          "Rinde peor en terreno muy blando o con mucho barro.",
        ],
      },
      { type: "h2", text: "Cómo decidir en dos minutos" },
      {
        type: "p",
        text: "Hazte tres preguntas. Primera: ¿la excavación pasa de unos cuatro metros de profundidad o el volumen es grande? Si sí, excavadora. Segunda: ¿necesitas también cargar, acarrear o nivelar en la misma obra? Si sí, retroexcavadora. Tercera: ¿la obra está en zona urbana y el traslado sería caro? Ese punto suele inclinar la balanza hacia la retroexcavadora incluso cuando la excavadora sería técnicamente mejor.",
      },
      {
        type: "note",
        text: "Si el trabajo es de limpieza superficial, nivelación o carga en espacio reducido, quizá no necesites ninguna de las dos: un minicargador suele ser más barato por hora y más ágil.",
      },
    ],
  },
  {
    slug: "que-maquinaria-necesito-para-movimiento-de-tierras",
    title: "Qué maquinaria necesitas para un movimiento de tierras",
    excerpt:
      "Un movimiento de tierras no es una máquina: es una cadena. Si un eslabón va lento, los demás facturan parados.",
    publishedAt: "2026-05-02T00:00:00.000Z",
    readingMinutes: 7,
    categorySlugs: ["excavadoras", "volquetes", "rodillos", "motoniveladoras"],
    locationSlug: null,
    keywords: [
      "maquinaria para movimiento de tierras",
      "equipos movimiento de tierras",
      "qué máquinas necesito para nivelar terreno",
    ],
    body: [
      {
        type: "p",
        text: "El error más caro en un movimiento de tierras no es elegir la máquina equivocada: es desbalancear la cadena. Una excavadora grande cargando un solo volquete pequeño pasa la mitad del día esperando, y tú pagas esa espera por hora.",
      },
      { type: "h2", text: "Las cuatro etapas y su equipo" },
      { type: "h3", text: "1. Desbroce y limpieza" },
      {
        type: "p",
        text: "Retirar vegetación, capa orgánica y escombros. Según el tamaño: tractor sobre oruga para áreas grandes, minicargador para lotes urbanos, retroexcavadora para trabajos mixtos.",
      },
      { type: "h3", text: "2. Excavación y carga" },
      {
        type: "p",
        text: "Excavadora o cargador frontal, según si hay que excavar o solo mover material ya suelto. Aquí se define el ritmo de toda la obra: la capacidad del cucharón marca cuántos volquetes necesitas.",
      },
      { type: "h3", text: "3. Transporte" },
      {
        type: "p",
        text: "Volquetes. La regla práctica es simple: cuenta cuántos minutos tarda un volquete en ir, descargar y volver, divide por el tiempo que tarda la excavadora en llenarlo y así sabes cuántas unidades necesitas para que la excavadora nunca esté parada.",
      },
      { type: "h3", text: "4. Conformación y compactación" },
      {
        type: "p",
        text: "Motoniveladora para dar la rasante y el drenaje correctos, y rodillo compactador para alcanzar la densidad que exige el expediente. Esta etapa es la que más se subestima y la que más caro se paga cuando se hace mal: un relleno mal compactado se asienta y arrastra consigo todo lo que construyas encima.",
      },
      { type: "h2", text: "Cómo dimensionar sin sobrecontratar" },
      {
        type: "ol",
        items: [
          "Calcula el volumen real en metros cúbicos, no «a ojo».",
          "Aplica el factor de esponjamiento: el material excavado ocupa más suelto que compactado, y los volquetes transportan volumen suelto.",
          "Define el plazo. El plazo es lo que decide cuántas máquinas necesitas a la vez.",
          "Balancea la cadena: capacidad de carga por hora ≈ capacidad de transporte por hora.",
          "Deja margen. Una máquina en falla técnica, una lluvia o un acceso cerrado no son excepciones: son parte del promedio.",
        ],
      },
      {
        type: "note",
        text: "Si no tienes claro el volumen, empieza por ahí antes de pedir cotizaciones. Sin metros cúbicos, ningún propietario puede darte un precio firme y todas las cotizaciones que recibas serán incomparables entre sí.",
      },
    ],
  },
  {
    slug: "como-calcular-las-horas-de-maquinaria-para-una-obra",
    title: "Cómo calcular las horas de maquinaria que necesita tu obra",
    excerpt:
      "El método que usan los presupuestos de obra, explicado sin fórmulas imposibles, para que no te sorprenda la factura final.",
    publishedAt: "2026-05-10T00:00:00.000Z",
    readingMinutes: 6,
    categorySlugs: ["excavadoras", "minicargadores"],
    locationSlug: null,
    keywords: [
      "calcular horas de maquinaria",
      "rendimiento de maquinaria por hora",
      "presupuesto de alquiler de maquinaria",
    ],
    body: [
      {
        type: "p",
        text: "Alquilar por hora sin saber cuántas horas vas a necesitar es la forma más rápida de que un presupuesto se descontrole. La buena noticia es que el cálculo básico cabe en una servilleta.",
      },
      { type: "h2", text: "La fórmula" },
      {
        type: "p",
        text: "Horas necesarias = Volumen de trabajo ÷ Rendimiento por hora. La dificultad no está en la división, sino en no engañarse con el rendimiento.",
      },
      { type: "h2", text: "El rendimiento real no es el del catálogo" },
      {
        type: "p",
        text: "La ficha técnica de una máquina da su rendimiento teórico, en condiciones ideales. En obra nunca se alcanza. Sobre el rendimiento teórico hay que aplicar factores de corrección por:",
      },
      {
        type: "ul",
        items: [
          "Tipo de material: no es lo mismo arena suelta que arcilla compacta o roca fracturada.",
          "Eficiencia del ciclo de trabajo: ninguna máquina trabaja 60 minutos de cada hora. Entre 45 y 50 es lo realista.",
          "Experiencia del operador, que puede mover el rendimiento en un rango amplio.",
          "Condiciones del sitio: espacio de maniobra, accesos, distancia de acarreo.",
          "Clima y horario: calor extremo y trabajo nocturno reducen el ritmo.",
        ],
      },
      { type: "h2", text: "Un ejemplo de método (no de cifras)" },
      {
        type: "p",
        text: "Supón que tienes que mover un volumen conocido de material. Pides al propietario el rendimiento que su máquina y su operador logran en un trabajo parecido —esa cifra la tiene, porque la ha medido en obra—, la corriges por eficiencia de ciclo y divides. Al resultado súmale el tiempo de traslado, el montaje y los imprevistos. Ese número, no el optimista, es el que debe entrar a tu presupuesto.",
      },
      { type: "h2", text: "Tres consejos que ahorran dinero de verdad" },
      {
        type: "ol",
        items: [
          "Pregunta el rendimiento al propietario y compáralo con el de otro. Si uno da una cifra muy superior, pide que la explique.",
          "Compara tarifa por hora contra tarifa por día antes de cerrar: a partir de seis o siete horas, el día suele ganar.",
          "Ten el frente de trabajo listo antes de que llegue la máquina. Las horas de espera se pagan igual que las de trabajo.",
        ],
      },
    ],
  },
  {
    slug: "que-revisar-antes-de-alquilar-maquinaria-pesada",
    title: "Qué revisar antes de alquilar maquinaria pesada",
    excerpt:
      "Una lista corta de verificaciones, antes de firmar y el día que llega la máquina, que evita la mayoría de los problemas caros.",
    publishedAt: "2026-05-16T00:00:00.000Z",
    readingMinutes: 5,
    categorySlugs: ["excavadoras", "retroexcavadoras", "cargadores-frontales"],
    locationSlug: null,
    keywords: [
      "qué revisar antes de alquilar maquinaria",
      "checklist alquiler maquinaria pesada",
      "recomendaciones alquiler maquinaria",
    ],
    body: [
      {
        type: "p",
        text: "La mayoría de los conflictos en un alquiler de maquinaria no nacen de la mala fe, sino de cosas que nadie puso por escrito. Esta lista está pensada para resolverlas en los cinco minutos previos, no en la discusión posterior.",
      },
      { type: "h2", text: "Antes de cerrar el trato" },
      {
        type: "ol",
        items: [
          "Confirma marca, modelo y año exactos. Pide fotos recientes de la máquina real, no de catálogo.",
          "Pregunta las horas de trabajo del equipo. Es el equivalente al kilometraje.",
          "Aclara qué incluye la tarifa: operador, combustible, traslado, implementos.",
          "Define el mínimo de contratación y qué pasa si el trabajo se extiende o se acorta.",
          "Acuerda quién asume las horas si la máquina se detiene por avería.",
          "Pregunta si el equipo cuenta con seguro y qué cubre.",
          "Deja todo por escrito, aunque sea en el mismo chat de WhatsApp. Un chat es prueba.",
        ],
      },
      { type: "h2", text: "El día que llega la máquina" },
      {
        type: "ol",
        items: [
          "Revísala con el operador presente y toma fotos del estado inicial: orugas o llantas, cucharón, cabina, fugas visibles.",
          "Anota la lectura del horómetro al empezar y al terminar cada jornada.",
          "Verifica que el acceso a la obra permite el ingreso del equipo y del camión que lo traslada.",
          "Asegúrate de que el frente de trabajo esté despejado: las horas de espera se cobran.",
        ],
      },
      { type: "h2", text: "Señales de alerta" },
      {
        type: "ul",
        items: [
          "Se niegan a enviar fotos recientes o a mostrar la máquina antes del alquiler.",
          "Piden un adelanto alto por adelantado sin ningún respaldo ni comprobante.",
          "El precio está muy por debajo del resto sin ninguna explicación.",
          "No quieren precisar por escrito qué incluye la tarifa.",
        ],
      },
      {
        type: "note",
        text: "En MaquiFly cada publicación tiene la opción «Reportar publicación». Si detectas información falsa, un precio que no corresponde o un posible fraude, avísanos: es la forma en que la plataforma se limpia sola.",
      },
    ],
  },
];

export const blogBySlug = new Map(blogPosts.map((p) => [p.slug, p]));

export function getPost(slug: string): BlogPost | undefined {
  return blogBySlug.get(slug);
}

export const sortedPosts = [...blogPosts].sort((a, b) =>
  b.publishedAt.localeCompare(a.publishedAt),
);
