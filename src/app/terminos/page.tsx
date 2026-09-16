import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { LegalList, LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = pageMetadata({
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso de MaquiFly, plataforma de conexión entre propietarios de maquinaria y personas que la necesitan.",
  path: "/terminos",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      updatedAt="mayo de 2026"
      intro="Estos términos regulan el uso de MaquiFly. Al usar la plataforma, publicando maquinaria o contactando a un propietario, aceptas lo que se describe a continuación."
    >
      <LegalSection title="1. Qué es MaquiFly">
        <p>
          MaquiFly es una plataforma digital que conecta a propietarios de
          maquinaria y equipos con personas y empresas interesadas en
          alquilarlos. Su función es facilitar el descubrimiento y el contacto
          entre ambas partes.
        </p>
        <p>
          <strong>MaquiFly no es propietaria de las máquinas publicadas</strong>,
          no las alquila, no fija sus precios, no las inspecciona, no participa
          en el contrato de alquiler y no interviene en el pago. El acuerdo se
          celebra directa y exclusivamente entre el propietario y el cliente.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso de la plataforma">
        <p>Al usar MaquiFly te comprometes a:</p>
        <LegalList
          items={[
            "Proporcionar información veraz, actual y exacta.",
            "Publicar únicamente maquinaria de tu propiedad o sobre la que tengas autorización expresa para alquilar.",
            "No publicar contenido falso, engañoso, ofensivo o que infrinja derechos de terceros.",
            "No usar la plataforma para actividades fraudulentas o contrarias a la ley.",
            "No extraer de forma automatizada los datos de contacto publicados por otros usuarios.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Publicaciones">
        <p>
          El propietario es el único responsable del contenido de su
          publicación: características técnicas, estado del equipo, precio,
          disponibilidad y condiciones. MaquiFly puede revisar, editar, ocultar
          o eliminar publicaciones que incumplan estos términos, que contengan
          información falsa o que sean reportadas de forma fundamentada por
          otros usuarios.
        </p>
        <p>
          Publicar es gratuito en la etapa actual. Si en el futuro se
          introducen servicios de pago, serán opcionales, se anunciarán con
          antelación y no se aplicarán de forma retroactiva a publicaciones
          creadas sin costo.
        </p>
      </LegalSection>

      <LegalSection title="4. Contacto y acuerdos entre usuarios">
        <p>
          El contacto se realiza directamente entre las partes, habitualmente
          por WhatsApp. Precio final, fechas, condiciones, garantías, seguros,
          traslado y forma de pago se acuerdan entre propietario y cliente sin
          intervención de MaquiFly.
        </p>
        <p>
          Recomendamos dejar por escrito qué incluye la tarifa, qué ocurre si
          el equipo se detiene por avería y quién responde por daños a
          terceros, antes de que la máquina entre a obra.
        </p>
      </LegalSection>

      <LegalSection title="5. Reseñas y reputación">
        <p>
          Las reseñas deben reflejar experiencias reales. Está prohibido
          publicar reseñas falsas, solicitarlas a cambio de contraprestación o
          publicar reseñas sobre uno mismo o sobre la competencia.
        </p>
        <p>
          MaquiFly puede retirar reseñas que incumplan esta regla y, en caso de
          reincidencia, suspender la cuenta responsable. El distintivo de
          «alquiler verificado» se aplica únicamente cuando la plataforma
          registró la operación.
        </p>
      </LegalSection>

      <LegalSection title="6. Verificación">
        <p>
          Los niveles de verificación indican exactamente lo que MaquiFly
          comprobó. «Propietario registrado» significa solo que la cuenta
          existe. «Propietario verificado» significa que se contrastaron datos
          de identidad o de empresa y se validó el contacto. La verificación no
          constituye garantía sobre el estado mecánico del equipo ni sobre el
          cumplimiento del propietario.
        </p>
      </LegalSection>

      <LegalSection title="7. Limitación de responsabilidad">
        <p>
          MaquiFly no responde por la calidad, el estado, la seguridad, la
          legalidad ni la disponibilidad real de la maquinaria publicada, ni
          por el cumplimiento de los acuerdos alcanzados entre usuarios, ni por
          daños derivados del uso de los equipos.
        </p>
        <p>
          La plataforma se ofrece «tal cual». Se hacen esfuerzos razonables por
          mantener el servicio disponible y la información actualizada, sin
          garantizar la ausencia de errores o interrupciones.
        </p>
      </LegalSection>

      <LegalSection title="8. Propiedad intelectual">
        <p>
          La marca MaquiFly, su identidad visual y el software de la plataforma
          son propiedad de MaquiFly. El contenido publicado por cada usuario
          (textos y fotografías) sigue siendo suyo; al publicarlo concede a
          MaquiFly una licencia no exclusiva para mostrarlo dentro de la
          plataforma y en materiales de difusión de la misma.
        </p>
      </LegalSection>

      <LegalSection title="9. Modificaciones y contacto">
        <p>
          Estos términos pueden actualizarse. Los cambios relevantes se
          comunicarán a través de la plataforma. Para cualquier consulta sobre
          este documento, escribe a {siteConfig.contact.email}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
