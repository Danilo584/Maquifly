import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidad",
  description:
    "Qué datos recoge MaquiFly, para qué los usa, con quién se comparten y qué derechos tienes sobre ellos.",
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      updatedAt="mayo de 2026"
      intro="Esta política explica qué datos personales trata MaquiFly, con qué finalidad y qué control tienes sobre ellos."
    >
      <LegalSection title="1. Principio general">
        <p>
          MaquiFly recoge los datos mínimos necesarios para que la plataforma
          funcione. No se solicita información sensible ni datos que no sean
          imprescindibles para publicar maquinaria o para poner en contacto a
          las partes.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué datos se tratan">
        <LegalList
          items={[
            "Datos de contacto que tú proporcionas al publicar: nombre o razón social, número de WhatsApp, teléfono alternativo y, opcionalmente, correo electrónico.",
            "Datos de la publicación: características de la máquina, distrito o zona donde se encuentra, condiciones y fotografías que subas.",
            "Datos que envías al usar formularios de contacto, solicitud de información o reporte de publicaciones.",
            "Datos técnicos de uso agregados (páginas vistas, búsquedas realizadas) cuando exista una herramienta de analítica conectada.",
          ]}
        />
        <p>
          <strong>MaquiFly no publica direcciones exactas.</strong> En la ficha
          de la máquina solo se muestra el distrito o la zona; la dirección
          concreta la compartes tú directamente al coordinar el alquiler.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué se usan">
        <LegalList
          items={[
            "Mostrar tu publicación a quienes buscan ese tipo de maquinaria.",
            "Permitir que un cliente interesado te contacte.",
            "Revisar y moderar publicaciones y reportes.",
            "Mejorar el buscador y entender qué maquinaria se busca más, a partir de datos agregados.",
            "Comunicarnos contigo sobre tus publicaciones.",
          ]}
        />
        <p>
          Los datos de contacto que publicas en tu anuncio son visibles para
          quienes visitan la plataforma: esa es, precisamente, la función de la
          publicación.
        </p>
      </LegalSection>

      <LegalSection title="4. Con quién se comparten">
        <p>
          No vendemos datos personales. Se comparten únicamente con los
          proveedores tecnológicos necesarios para operar el servicio
          (alojamiento web, base de datos y almacenamiento de imágenes), y con
          la otra parte cuando tú inicias un contacto.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies y analítica">
        <p>
          En el estado actual del proyecto no hay herramientas de analítica ni
          cookies de terceros conectadas. Cuando se integren, se detallará aquí
          qué se recoge y se habilitará un mecanismo de consentimiento antes de
          activarlas.
        </p>
        <p>
          La plataforma sí utiliza almacenamiento local del navegador para
          funciones propias, como guardar el borrador de una publicación en tu
          dispositivo. Esa información no sale de tu navegador.
        </p>
      </LegalSection>

      <LegalSection title="6. Conservación">
        <p>
          Los datos asociados a una publicación se conservan mientras la
          publicación esté activa y durante un periodo razonable posterior para
          atender reclamos o reportes. Puedes solicitar la eliminación de tu
          publicación y de tus datos en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          Puedes solicitar acceso, rectificación, actualización, oposición o
          supresión de tus datos personales escribiendo a{" "}
          {siteConfig.contact.email}. Responderemos en un plazo razonable.
        </p>
        <p>
          El tratamiento de datos personales en el Perú está regulado por la
          normativa de protección de datos personales vigente. Este documento
          será revisado por un especialista antes de la operación comercial
          para asegurar su cumplimiento pleno.
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Se aplican medidas razonables de seguridad: validación de entradas,
          control de permisos por usuario, protección de los endpoints del
          servicio y almacenamiento de credenciales fuera del código. Ningún
          sistema es infalible; si detectas un problema de seguridad, escríbenos
          antes de divulgarlo.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
