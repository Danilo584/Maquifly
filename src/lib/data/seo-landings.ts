/**
 * LANDINGS DE BÚSQUEDA LOCAL
 * ---------------------------------------------------------------------------
 * Páginas orientadas a búsquedas reales del tipo «alquiler de excavadora
 * Piura». Cada una tiene contenido propio y escrito a mano.
 *
 * Regla explícita del proyecto: NO se generan cientos de combinaciones
 * categoría × ciudad vacías. Una página sin contenido útil no posiciona, y
 * cuando posiciona, decepciona a quien entra. Aquí solo hay landings de la
 * ciudad donde MaquiFly está activo y de las categorías con demanda real.
 *
 * Añadir una ciudad nueva = añadir sus entradas a esta lista con su texto.
 * La estructura de URL ya soporta /alquiler-excavadoras-chiclayo sin tocar
 * ningún componente.
 */
export interface SeoLanding {
  slug: string;
  /** Slug de categoría, o null para una landing general de la ciudad. */
  categorySlug: string | null;
  locationSlug: string;
  h1: string;
  title: string;
  description: string;
  intro: string[];
  sections: Array<{ heading: string; paragraphs?: string[]; bullets?: string[] }>;
  keywords: string[];
  /** Otras landings relacionadas, por slug. */
  related: string[];
}

export const seoLandings: SeoLanding[] = [
  {
    slug: "alquiler-maquinaria-piura",
    categorySlug: null,
    locationSlug: "piura",
    h1: "Alquiler de maquinaria en Piura",
    title: "Alquiler de maquinaria en Piura — equipos y propietarios locales",
    description:
      "Encuentra maquinaria y equipos en alquiler en Piura: minicargadores, excavadoras, retroexcavadoras, volquetes, rodillos, generadores y más. Contacta directamente al propietario.",
    intro: [
      "Piura concentra un tipo de demanda de maquinaria muy particular: obra urbana en crecimiento, agroexportación con campañas marcadas, saneamiento, infraestructura vial y una fuerte actividad de habilitación de terrenos. Eso significa que la misma semana puede haber un contratista buscando una retroexcavadora para zanjas en Castilla y un agricultor buscando un tractor en Tambogrande.",
      "El problema no es que no haya maquinaria en la región. El problema es encontrarla: buena parte del alquiler se mueve por contactos, grupos de WhatsApp y recomendaciones, y una máquina disponible puede pasar semanas parada mientras alguien a quince minutos la está buscando. MaquiFly existe para cerrar esa distancia.",
    ],
    sections: [
      {
        heading: "Qué maquinaria se alquila más en Piura",
        bullets: [
          "Minicargadores y retroexcavadoras para obra urbana y saneamiento, donde el espacio de maniobra es reducido.",
          "Excavadoras y cargadores frontales para movimiento de tierras, canteras y habilitación de terrenos.",
          "Volquetes para transporte de agregados y eliminación de desmonte, un servicio que se cotiza por viaje o por día.",
          "Rodillos y motoniveladoras para obras viales, accesos y plataformas.",
          "Generadores eléctricos, muy demandados por la irregularidad del suministro en zonas de expansión.",
          "Tractores e implementos agrícolas, con demanda concentrada en las ventanas de campaña del valle.",
        ],
      },
      {
        heading: "Zonas donde MaquiFly está buscando propietarios",
        paragraphs: [
          "El arranque se concentra en Piura cercado, Castilla, Veintiséis de Octubre, Catacaos, Sullana, Paita y Tambogrande, que es donde se cruza la mayor parte de la demanda de obra y agroindustria. Si tienes maquinaria en cualquiera de estas zonas, tu publicación aparece en las búsquedas de quienes trabajan cerca.",
        ],
      },
      {
        heading: "Cómo funciona alquilar por MaquiFly",
        paragraphs: [
          "Buscas el equipo por categoría o por nombre, filtras por zona y por condiciones (con operador, con transporte, disponible), entras a la publicación y contactas al propietario por WhatsApp con un mensaje que ya incluye la máquina y el código de la publicación. El precio, las fechas y las condiciones las acuerdas directamente con él: MaquiFly no cobra comisión ni interviene en el acuerdo.",
        ],
      },
    ],
    keywords: [
      "alquiler de maquinaria Piura",
      "alquiler de maquinaria pesada Piura",
      "maquinaria pesada Piura",
      "alquiler de equipos Piura",
    ],
    related: [
      "alquiler-minicargadores-piura",
      "alquiler-excavadoras-piura",
      "alquiler-retroexcavadoras-piura",
      "alquiler-volquetes-piura",
    ],
  },
  {
    slug: "alquiler-maquinaria-pesada-piura",
    categorySlug: null,
    locationSlug: "piura",
    h1: "Alquiler de maquinaria pesada en Piura",
    title: "Alquiler de maquinaria pesada en Piura — excavadoras, cargadores y volquetes",
    description:
      "Maquinaria pesada en alquiler en Piura: excavadoras, cargadores frontales, volquetes, rodillos, motoniveladoras y tractores. Compara equipos y contacta al propietario.",
    intro: [
      "Se llama maquinaria pesada al conjunto de equipos de movimiento de tierras, compactación y transporte de gran volumen: excavadoras, cargadores frontales, volquetes, rodillos, motoniveladoras y tractores sobre oruga. Son las máquinas de mayor costo por hora y, por lo mismo, donde más caro sale equivocarse.",
      "En Piura, la mayor parte de este alquiler se concentra en habilitación de terrenos, obra vial, saneamiento y canteras. La logística pesa: el traslado de una máquina sobre orugas exige cama baja, y ese costo puede cambiar por completo la comparación entre dos cotizaciones.",
    ],
    sections: [
      {
        heading: "Lo que más encarece un alquiler de maquinaria pesada",
        bullets: [
          "El traslado. Una máquina que ya está cerca de tu obra suele salir más barata que otra con mejor tarifa por hora pero a dos horas de distancia.",
          "Las horas parada. Si el frente de trabajo no está listo, la máquina factura igual.",
          "La cadena mal balanceada. Una excavadora esperando volquetes es dinero quemado.",
          "El combustible, que en equipos grandes deja de ser un detalle.",
        ],
      },
      {
        heading: "Antes de pedir cotización, ten estos datos",
        bullets: [
          "Volumen de trabajo en metros cúbicos, no estimado a ojo.",
          "Plazo de la obra y fechas concretas.",
          "Distrito y referencia de acceso a la obra.",
          "Si necesitas operador y si necesitas traslado.",
          "Tipo de terreno: arena, arcilla, material de río o roca.",
        ],
      },
      {
        heading: "Seguridad y responsabilidad",
        paragraphs: [
          "MaquiFly es una plataforma de conexión: no inspecciona el estado mecánico de los equipos ni participa en el contrato. Antes de que la máquina entre a obra, deja por escrito qué incluye la tarifa, quién asume las horas si el equipo se detiene por avería y quién responde por daños a terceros. Un acuerdo claro en el mismo chat de WhatsApp es prueba suficiente y evita casi todos los conflictos.",
        ],
      },
    ],
    keywords: [
      "alquiler de maquinaria pesada",
      "alquiler de maquinaria pesada Piura",
      "maquinaria pesada en Piura",
      "movimiento de tierras Piura",
    ],
    related: [
      "alquiler-excavadoras-piura",
      "alquiler-volquetes-piura",
      "alquiler-maquinaria-piura",
    ],
  },
  {
    slug: "alquiler-minicargadores-piura",
    categorySlug: "minicargadores",
    locationSlug: "piura",
    h1: "Alquiler de minicargadores en Piura",
    title: "Alquiler de minicargadores en Piura — con operador y transporte",
    description:
      "Minicargadores en alquiler en Piura para limpieza de terrenos, nivelación y carga en espacios reducidos. Revisa características, ubicación y contacta al propietario.",
    intro: [
      "El minicargador es probablemente la máquina más pedida en obra urbana de Piura, y la razón es simple: entra donde no entra nada más. Lotes estrechos en zonas de expansión, patios industriales, calles con poco espacio de maniobra, interiores de nave. Donde una retroexcavadora necesita media cuadra para girar, un minicargador trabaja en su propio eje.",
      "Su otra ventaja es el implemento. Con la máquina base puedes cargar, nivelar, barrer, perforar o romper pavimento cambiando el accesorio. Al cotizar, pregunta siempre qué implementos incluye la tarifa: es la diferencia más frecuente entre dos precios que parecían iguales.",
    ],
    sections: [
      {
        heading: "Trabajos típicos en Piura",
        bullets: [
          "Limpieza y nivelación de lotes antes de construir.",
          "Carga de arena, piedra y hormigón en obras de vivienda.",
          "Eliminación de desmonte en obras urbanas.",
          "Movimiento de material en almacenes, plantas y patios.",
          "Apoyo en obras de saneamiento donde el espacio es reducido.",
        ],
      },
      {
        heading: "Qué preguntar antes de cerrar",
        bullets: [
          "¿Qué implementos incluye: solo cuchara, o también martillo o barredora?",
          "¿El operador está incluido en el precio o se cobra aparte?",
          "¿Ofrecen traslado hasta la obra y cuánto cuesta?",
          "¿Cuál es el mínimo de contratación?",
          "¿Cuántas horas de trabajo tiene el equipo?",
        ],
      },
      {
        heading: "¿Minicargador o retroexcavadora?",
        paragraphs: [
          "Si el trabajo es superficial —limpiar, nivelar, cargar— y el espacio es reducido, el minicargador gana por agilidad y por costo. Si además necesitas excavar zanjas con cierta profundidad, la retroexcavadora resuelve las dos cosas con un solo alquiler y llega sola a la obra sin cama baja.",
        ],
      },
    ],
    keywords: [
      "alquiler de minicargador Piura",
      "minicargador en Piura",
      "alquiler minicargadores Piura",
      "minicargador con operador Piura",
    ],
    related: [
      "alquiler-retroexcavadoras-piura",
      "alquiler-maquinaria-piura",
      "alquiler-excavadoras-piura",
    ],
  },
  {
    slug: "alquiler-excavadoras-piura",
    categorySlug: "excavadoras",
    locationSlug: "piura",
    h1: "Alquiler de excavadoras en Piura",
    title: "Alquiler de excavadoras en Piura — sobre orugas, con operador",
    description:
      "Excavadoras en alquiler en Piura para excavación profunda, cimentaciones y movimiento de tierras. Compara equipos disponibles y contacta directamente al propietario.",
    intro: [
      "La excavadora sobre orugas es la máquina de referencia cuando hay que excavar profundo o mover volumen. En Piura se usa sobre todo en cimentaciones, zanjas de saneamiento de cierta profundidad, limpieza de drenes y canales, carga en cantera y habilitación de terrenos grandes.",
      "Su tamaño es también su principal costo oculto: no se desplaza por vía pública. Necesita cama baja para llegar a la obra, y ese traslado —ida y vuelta— se cotiza aparte de la tarifa por hora. Por eso, para un trabajo corto, una excavadora lejana con buena tarifa puede salir más cara que una cercana con tarifa más alta.",
    ],
    sections: [
      {
        heading: "Cuándo conviene una excavadora y cuándo no",
        bullets: [
          "Conviene si la excavación pasa de unos cuatro metros de profundidad.",
          "Conviene si el volumen es grande y el plazo, ajustado.",
          "Conviene si necesitas implementos hidráulicos: martillo, cizalla, pulverizador.",
          "No conviene para trabajos superficiales y cortos en zona urbana: el traslado se come el ahorro.",
        ],
      },
      {
        heading: "Cómo dimensionar el equipo",
        paragraphs: [
          "Lo que define el tamaño no es la profundidad sola, sino la combinación de volumen, plazo y acceso. Una excavadora de 20 toneladas rinde mucho más por hora que una de 8, pero necesita espacio y un traslado más caro. Si el acceso a la obra es estrecho o el terreno es blando, esa ventaja se pierde rápido.",
          "Una regla práctica: define primero cuántos metros cúbicos hay que mover y en cuántos días, y pide al propietario el rendimiento real que logra su máquina con su operador en un trabajo parecido. Ese dato lo tiene medido.",
        ],
      },
      {
        heading: "Balancea la excavadora con los volquetes",
        paragraphs: [
          "El error más caro en movimiento de tierras es contratar una excavadora potente y dejarla esperando transporte. Calcula cuántos minutos tarda un volquete en ir, descargar y volver, y cuántos necesitas para que la excavadora no se detenga. Es el cálculo que separa un presupuesto que se cumple de uno que se dispara.",
        ],
      },
    ],
    keywords: [
      "alquiler de excavadora Piura",
      "excavadora en Piura",
      "alquiler excavadoras Piura",
      "excavadora con operador Piura",
    ],
    related: [
      "alquiler-volquetes-piura",
      "alquiler-maquinaria-pesada-piura",
      "alquiler-retroexcavadoras-piura",
    ],
  },
  {
    slug: "alquiler-retroexcavadoras-piura",
    categorySlug: "retroexcavadoras",
    locationSlug: "piura",
    h1: "Alquiler de retroexcavadoras en Piura",
    title: "Alquiler de retroexcavadoras en Piura — zanjas, carga y obra urbana",
    description:
      "Retroexcavadoras en alquiler en Piura para zanjas de agua y desagüe, carga de material y obra urbana. Revisa condiciones y contacta al propietario por WhatsApp.",
    intro: [
      "Para obras pequeñas y medianas en Piura, la retroexcavadora suele ser la opción más rentable del mercado, y no por su tarifa por hora sino por lo que ahorra alrededor: se desplaza por vía pública sin cama baja, y resuelve excavación y carga sin necesidad de alquilar dos máquinas.",
      "Es la máquina típica de las obras de saneamiento, de las conexiones domiciliarias, del cableado y del mantenimiento de caminos rurales del valle.",
    ],
    sections: [
      {
        heading: "Para qué se usa más en la región",
        bullets: [
          "Zanjas para agua, desagüe y cableado eléctrico.",
          "Carga y acarreo corto de material en obra.",
          "Obras de saneamiento y redes en zonas urbanas.",
          "Mantenimiento de caminos y accesos rurales.",
          "Trabajos mixtos donde hay que excavar y cargar el mismo día.",
        ],
      },
      {
        heading: "Su gran ventaja: el traslado",
        paragraphs: [
          "Una retroexcavadora llega sola a la obra. En trabajos de uno o dos días, evitar el costo de cama baja puede representar una parte muy relevante del total. Es la razón por la que, en obra urbana, suele ganarle a una excavadora incluso cuando esta última sería técnicamente superior.",
        ],
      },
      {
        heading: "Sus límites",
        paragraphs: [
          "Excava menos profundo y mueve menos volumen por hora que una excavadora, y rinde peor en terreno muy blando o embarrado, donde las llantas pierden tracción. Si tu obra exige profundidad real o volumen alto, la retroexcavadora se quedará corta a mitad de camino y terminarás pagando dos alquileres.",
        ],
      },
    ],
    keywords: [
      "alquiler de retroexcavadora Piura",
      "retroexcavadora en Piura",
      "alquiler retroexcavadoras Piura",
      "retroexcavadora para zanjas Piura",
    ],
    related: [
      "alquiler-minicargadores-piura",
      "alquiler-excavadoras-piura",
      "alquiler-maquinaria-piura",
    ],
  },
  {
    slug: "alquiler-volquetes-piura",
    categorySlug: "volquetes",
    locationSlug: "piura",
    h1: "Alquiler de volquetes en Piura",
    title: "Alquiler de volquetes en Piura — agregados, desmonte y transporte de obra",
    description:
      "Volquetes en alquiler en Piura para transporte de arena, piedra, hormigón y eliminación de desmonte. Consulta capacidad, zona y condiciones con el propietario.",
    intro: [
      "El volquete es el eslabón que casi nadie calcula bien. Se contrata la excavadora con detalle y el transporte se resuelve «sobre la marcha», y el resultado es una máquina de carga parada esperando camiones.",
      "En Piura, el alquiler de volquetes se mueve en tres modalidades distintas —por viaje, por hora y por día— y confundirlas es la fuente más común de discusiones al momento de facturar.",
    ],
    sections: [
      {
        heading: "Las tres modalidades de cobro",
        bullets: [
          "Por viaje: habitual en abastecimiento de material y eliminación de desmonte. El precio depende de la distancia y del número de viajes.",
          "Por hora: útil cuando el volquete trabaja dentro de una obra con ciclos cortos.",
          "Por día: conviene en obras de varios frentes o cuando el camión queda asignado a la obra.",
        ],
      },
      {
        heading: "Qué precisar al cotizar",
        bullets: [
          "Capacidad de tolva en metros cúbicos: 10, 15 o 20 m³ cambian por completo el cálculo.",
          "Origen y destino del material, con distancia aproximada.",
          "Número estimado de viajes por día.",
          "Quién asume el combustible y los peajes, si los hay.",
          "Si se requiere autorización municipal para eliminación de desmonte.",
        ],
      },
      {
        heading: "Cuántos volquetes necesitas",
        paragraphs: [
          "El cálculo es directo: mide cuánto tarda un volquete en el ciclo completo (cargar, ir, descargar, volver) y cuánto tarda tu equipo de carga en llenarlo. Divide el primero entre el segundo y tendrás el número de unidades que mantienen la carga trabajando sin pausas. Redondear hacia arriba casi siempre sale más barato que dejar parada una excavadora.",
        ],
      },
    ],
    keywords: [
      "alquiler de volquete Piura",
      "volquete en Piura",
      "alquiler volquetes Piura",
      "transporte de agregados Piura",
    ],
    related: [
      "alquiler-excavadoras-piura",
      "alquiler-maquinaria-pesada-piura",
      "alquiler-maquinaria-piura",
    ],
  },
];

export const landingsBySlug = new Map(seoLandings.map((l) => [l.slug, l]));

export function getLanding(slug: string): SeoLanding | undefined {
  return landingsBySlug.get(slug);
}
