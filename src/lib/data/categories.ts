import type { Category } from "@/lib/types";

/**
 * Catálogo de categorías.
 * Agregar una categoría nueva = agregar un objeto aquí. La página SEO, el
 * filtro, el menú y el sitemap se generan automáticamente a partir de esta
 * lista, sin tocar componentes.
 */
export const categories: Category[] = [
  {
    id: "cat-minicargadores",
    name: "Minicargadores",
    singular: "Minicargador",
    slug: "minicargadores",
    family: "heavy",
    shortDescription: "Ágiles y compactos, ideales para espacios reducidos.",
    longDescription:
      "El minicargador es la máquina más versátil para obras urbanas y terrenos con poco espacio de maniobra. Trabaja donde una excavadora no entra: patios, calles estrechas, interiores de nave y lotes en habilitación. Con el implemento adecuado carga material, nivela, barre, perfora o rompe pavimento con la misma máquina.",
    commonUses: [
      "Limpieza y nivelación de terrenos",
      "Carga de desmonte, arena y hormigón",
      "Trabajo en obras urbanas con poco espacio",
      "Movimiento de material en almacenes y canteras",
      "Preparación de terreno antes de construir",
    ],
    icon: "skid-steer",
    order: 1,
  },
  {
    id: "cat-excavadoras",
    name: "Excavadoras",
    singular: "Excavadora",
    slug: "excavadoras",
    family: "heavy",
    shortDescription: "Excavación profunda y movimiento de tierras de volumen.",
    longDescription:
      "La excavadora sobre orugas es la máquina de referencia para excavación profunda, zanjas, cimentaciones y movimiento de tierras de volumen. Su giro de 360° y su alcance permiten trabajar sin reposicionar la máquina constantemente, lo que reduce las horas facturadas en obras medianas y grandes.",
    commonUses: [
      "Excavación de zanjas y cimentaciones",
      "Movimiento de tierras de gran volumen",
      "Carga de volquetes en cantera",
      "Demolición con implemento hidráulico",
      "Limpieza de drenes y canales",
    ],
    icon: "excavator",
    order: 2,
  },
  {
    id: "cat-retroexcavadoras",
    name: "Retroexcavadoras",
    singular: "Retroexcavadora",
    slug: "retroexcavadoras",
    family: "heavy",
    shortDescription: "Dos máquinas en una: carga por delante, excava por detrás.",
    longDescription:
      "La retroexcavadora combina un cargador frontal y un brazo excavador en el mismo equipo. Para obras pequeñas y medianas suele ser la opción más rentable: se desplaza por vía pública sin cama baja y resuelve excavación y carga sin alquilar dos máquinas distintas.",
    commonUses: [
      "Zanjas para agua, desagüe y cableado",
      "Carga y acarreo corto de material",
      "Obras de saneamiento y redes",
      "Trabajos mixtos de excavación y carga",
      "Mantenimiento de caminos rurales",
    ],
    icon: "backhoe",
    order: 3,
  },
  {
    id: "cat-cargadores-frontales",
    name: "Cargadores frontales",
    singular: "Cargador frontal",
    slug: "cargadores-frontales",
    family: "heavy",
    shortDescription: "Carga de gran volumen con ciclos rápidos.",
    longDescription:
      "El cargador frontal mueve grandes volúmenes de material suelto en poco tiempo. Es la máquina indicada para alimentar volquetes y plantas de procesamiento, apilar material y mantener frentes de trabajo en canteras y obras de movimiento de tierras.",
    commonUses: [
      "Carga de volquetes en cantera",
      "Apilamiento y traslado de agregados",
      "Alimentación de plantas chancadoras",
      "Limpieza de grandes superficies",
      "Manejo de material a granel",
    ],
    icon: "loader",
    order: 4,
  },
  {
    id: "cat-volquetes",
    name: "Volquetes",
    singular: "Volquete",
    slug: "volquetes",
    family: "heavy",
    shortDescription: "Transporte de agregados, desmonte y material de obra.",
    longDescription:
      "El volquete resuelve el transporte de material entre cantera, obra y botadero. Al cotizar conviene definir con claridad la capacidad en metros cúbicos, la distancia por viaje y si el precio se cobra por viaje, por hora o por día, porque las tres modalidades son habituales en el mercado peruano.",
    commonUses: [
      "Transporte de arena, piedra y hormigón",
      "Eliminación de desmonte",
      "Abastecimiento de material a obra",
      "Traslado de tierra en movimiento de tierras",
      "Apoyo logístico en proyectos viales",
    ],
    icon: "dump-truck",
    order: 5,
  },
  {
    id: "cat-rodillos",
    name: "Rodillos compactadores",
    singular: "Rodillo compactador",
    slug: "rodillos",
    family: "heavy",
    shortDescription: "Compactación de terreno, base y asfalto.",
    longDescription:
      "El rodillo compactador da al terreno la densidad que exige el expediente técnico. La elección depende del material: rodillo liso vibratorio para bases granulares y asfalto, pata de cabra para suelos cohesivos. Un mal compactado es una de las causas más caras de reparación posterior.",
    commonUses: [
      "Compactación de bases y sub-bases",
      "Pavimentación asfáltica",
      "Preparación de plataformas industriales",
      "Compactación de rellenos",
      "Obras viales y accesos",
    ],
    icon: "roller",
    order: 6,
  },
  {
    id: "cat-motoniveladoras",
    name: "Motoniveladoras",
    singular: "Motoniveladora",
    slug: "motoniveladoras",
    family: "heavy",
    shortDescription: "Nivelación fina y perfilado de vías.",
    longDescription:
      "La motoniveladora define la rasante: nivela con precisión, perfila taludes y conforma cunetas. Es la máquina clave en caminos rurales, accesos y plataformas donde la pendiente y el drenaje tienen que quedar exactos.",
    commonUses: [
      "Nivelación fina de plataformas",
      "Perfilado y mantenimiento de caminos",
      "Conformación de cunetas y taludes",
      "Preparación de vías antes del afirmado",
      "Obras viales",
    ],
    icon: "grader",
    order: 7,
  },
  {
    id: "cat-tractores-oruga",
    name: "Tractores sobre oruga",
    singular: "Tractor sobre oruga",
    slug: "tractores-oruga",
    family: "heavy",
    shortDescription: "Empuje de gran potencia y desbroce de terreno.",
    longDescription:
      "El tractor sobre oruga (bulldozer) empuja grandes volúmenes de material y abre terreno donde otras máquinas no avanzan. Se usa en desbroce, apertura de accesos, conformación de plataformas y empuje en canteras.",
    commonUses: [
      "Desbroce y limpieza de terreno",
      "Empuje de material en distancias cortas",
      "Apertura de accesos",
      "Conformación de plataformas",
      "Trabajo en cantera y minería",
    ],
    icon: "tractor",
    order: 8,
  },
  {
    id: "cat-gruas",
    name: "Grúas",
    singular: "Grúa",
    slug: "gruas",
    family: "heavy",
    shortDescription: "Izaje y montaje de cargas pesadas.",
    longDescription:
      "Las grúas resuelven el izaje de cargas que ningún otro equipo puede mover. Al cotizar hay que precisar peso de la carga, altura y radio de trabajo, porque de esos tres datos depende la capacidad de grúa necesaria y, con ella, el precio.",
    commonUses: [
      "Montaje de estructuras metálicas",
      "Izaje de equipos e instalaciones",
      "Descarga de contenedores y maquinaria",
      "Montaje de elementos prefabricados",
      "Obras industriales",
    ],
    icon: "crane",
    order: 9,
  },
  {
    id: "cat-plataformas-elevadoras",
    name: "Plataformas elevadoras",
    singular: "Plataforma elevadora",
    slug: "plataformas-elevadoras",
    family: "support",
    shortDescription: "Trabajo seguro en altura.",
    longDescription:
      "Las plataformas elevadoras (tijera y brazo articulado) permiten trabajar en altura con seguridad y sin armar andamios. Se usan en mantenimiento industrial, instalaciones eléctricas, fachadas y montaje de señalética o iluminación.",
    commonUses: [
      "Mantenimiento industrial en altura",
      "Instalaciones eléctricas y de iluminación",
      "Trabajos en fachadas",
      "Montaje de señalética y publicidad",
      "Limpieza de estructuras altas",
    ],
    icon: "lift",
    order: 10,
  },
  {
    id: "cat-manipuladores-telescopicos",
    name: "Manipuladores telescópicos",
    singular: "Manipulador telescópico",
    slug: "manipuladores-telescopicos",
    family: "support",
    shortDescription: "Elevar, alcanzar y colocar carga en altura.",
    longDescription:
      "El manipulador telescópico combina el alcance de una grúa pequeña con la movilidad de un montacargas todoterreno. Coloca material en altura y en pisos intermedios, algo habitual en obras de edificación y en logística agroindustrial.",
    commonUses: [
      "Colocación de material en altura",
      "Manejo de pallets en obra",
      "Logística agroindustrial",
      "Montaje en edificación",
      "Trabajo en terreno irregular",
    ],
    icon: "telehandler",
    order: 11,
  },
  {
    id: "cat-generadores",
    name: "Generadores eléctricos",
    singular: "Generador eléctrico",
    slug: "generadores",
    family: "support",
    shortDescription: "Energía en obra, eventos y contingencias.",
    longDescription:
      "Los grupos electrógenos dan energía donde no llega la red o donde el suministro no es confiable. Para dimensionarlos hay que sumar la potencia de los equipos a conectar y considerar el pico de arranque de motores, que puede triplicar el consumo nominal.",
    commonUses: [
      "Energía en obras sin conexión a red",
      "Respaldo ante cortes de suministro",
      "Eventos y campañas",
      "Alimentación de equipos de bombeo",
      "Trabajos agrícolas e industriales",
    ],
    icon: "generator",
    order: 12,
  },
  {
    id: "cat-mezcladoras",
    name: "Mezcladoras y equipos de concreto",
    singular: "Mezcladora",
    slug: "mezcladoras",
    family: "light",
    shortDescription: "Preparación y colocación de concreto en obra.",
    longDescription:
      "Mezcladoras, vibradores y equipos de bombeo para preparar y colocar concreto en obra. Son equipos de alquiler frecuente en construcción de vivienda, donde el volumen no justifica concreto premezclado.",
    commonUses: [
      "Preparación de concreto en obra",
      "Vaciado de losas y columnas",
      "Vibrado de concreto",
      "Obras de vivienda y autoconstrucción",
      "Trabajos de albañilería",
    ],
    icon: "mixer",
    order: 13,
  },
  {
    id: "cat-compactadoras",
    name: "Compactadoras ligeras",
    singular: "Compactadora",
    slug: "compactadoras",
    family: "light",
    shortDescription: "Planchas y canguros para espacios reducidos.",
    longDescription:
      "Planchas compactadoras y apisonadores tipo canguro para zanjas, veredas y áreas donde no entra un rodillo. Son equipos de bajo costo de alquiler y alto impacto en la calidad del acabado.",
    commonUses: [
      "Compactación de zanjas",
      "Veredas y pistas pequeñas",
      "Bases de adoquinado",
      "Reparaciones puntuales de pavimento",
      "Obras de saneamiento",
    ],
    icon: "compactor",
    order: 14,
  },
  {
    id: "cat-equipos-agricolas",
    name: "Equipos agrícolas",
    singular: "Equipo agrícola",
    slug: "equipos-agricolas",
    family: "agricultural",
    shortDescription: "Tractores e implementos para campaña agrícola.",
    longDescription:
      "Tractores agrícolas e implementos para preparación de terreno, siembra y cosecha. En una región agroexportadora como Piura, la demanda se concentra en ventanas de campaña muy marcadas, por lo que reservar con anticipación cambia el precio.",
    commonUses: [
      "Preparación de terreno agrícola",
      "Arado, rastra y surcado",
      "Siembra y fertilización",
      "Apoyo en cosecha",
      "Mantenimiento de parcelas",
    ],
    icon: "agri",
    order: 15,
  },
  {
    id: "cat-herramientas",
    name: "Herramientas y equipos menores",
    singular: "Herramienta",
    slug: "herramientas",
    family: "light",
    shortDescription: "Equipos de apoyo para obra y mantenimiento.",
    longDescription:
      "Martillos demoledores, cortadoras, motobombas, andamios, soldadoras y otros equipos de apoyo. Alquilarlos por días evita inmovilizar capital en herramientas que se usan pocas veces al año.",
    commonUses: [
      "Demolición puntual",
      "Corte de concreto y asfalto",
      "Bombeo de agua",
      "Soldadura en obra",
      "Trabajos de mantenimiento",
    ],
    icon: "tools",
    order: 16,
  },
];

export const categoriesBySlug = new Map(categories.map((c) => [c.slug, c]));
export const categoriesById = new Map(categories.map((c) => [c.id, c]));

export function getCategory(slug: string): Category | undefined {
  return categoriesBySlug.get(slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categoriesById.get(id);
}

/** Categorías destacadas en la home (el resto vive en /categorias). */
export const featuredCategorySlugs = [
  "minicargadores",
  "excavadoras",
  "retroexcavadoras",
  "volquetes",
  "cargadores-frontales",
  "rodillos",
  "gruas",
  "generadores",
  "equipos-agricolas",
  "herramientas",
];

export const familyLabels: Record<Category["family"], string> = {
  heavy: "Maquinaria pesada",
  light: "Equipos ligeros",
  agricultural: "Equipos agrícolas",
  support: "Equipos de apoyo",
};
