import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad | La Guaca',
  description: 'Política de privacidad y tratamiento de datos de La Guaca Boutique.',
}

export default function PoliticaDePrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#E8E6E1]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[#E8E6E1]/70 hover:text-[#E8E6E1] transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </Link>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
          Política de Privacidad
        </h1>
        <p className="font-mono text-[11px] tracking-widest text-[#E8E6E1]/60 uppercase mb-12">
          La Guaca · Última actualización
        </p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 font-body text-[#E8E6E1]/90 leading-relaxed">
          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              1. Responsable del tratamiento
            </h2>
            <p>
              La Guaca («nosotros», «la tienda») es responsable del tratamiento de los datos personales que nos facilitas al utilizar esta web y nuestros servicios (pedidos, contacto, suscripciones). Nos encuentras en Montería, Colombia.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              2. Datos que recogemos
            </h2>
            <p className="mb-3">Podemos recoger, entre otros:</p>
            <ul className="list-disc pl-6 space-y-1 text-[#E8E6E1]/85">
              <li>Nombre, correo electrónico y teléfono (celular/WhatsApp) para pedidos y comunicación.</li>
              <li>Dirección de entrega y datos necesarios para el envío.</li>
              <li>Datos de pago procesados de forma segura por nuestro proveedor de pagos (Wompi); no almacenamos datos completos de tarjeta.</li>
              <li>Datos de navegación (IP, tipo de dispositivo, páginas visitadas) para mejorar la web y la seguridad.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              3. Finalidad y base legal
            </h2>
            <p>
              Usamos tus datos para gestionar pedidos, envíos, atención al cliente y, si nos das consentimiento, para comunicaciones comerciales. La base legal es la ejecución del contrato (compra), el consentimiento cuando aplique, y nuestro interés legítimo en la seguridad y mejora del servicio.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              4. Cookies y tecnologías similares
            </h2>
            <p>
              Utilizamos cookies y almacenamiento local para el correcto funcionamiento de la tienda (sesión, carrito, preferencias). Puedes configurar tu navegador para limitar o bloquear cookies; ello puede afectar a algunas funciones del sitio.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              5. Cesión y terceros
            </h2>
            <p>
              Podemos compartir datos con proveedores necesarios para el servicio: pasarela de pago (Wompi), hosting y bases de datos (Vercel, Supabase), envíos y logística. Estos actúan como encargados del tratamiento y están obligados a usarlos solo para los fines acordados y a protegerlos.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              6. Conservación
            </h2>
            <p>
              Conservamos tus datos mientras exista una relación comercial o legal que lo justifique (por ejemplo, obligaciones fiscales o contables). Después, los bloqueamos o eliminamos conforme a la ley.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              7. Tus derechos
            </h2>
            <p className="mb-3">
              Puedes ejercer acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición al tratamiento de tus datos. Si consideras que el tratamiento no se ajusta a la normativa, tienes derecho a presentar una reclamación ante la autoridad de protección de datos competente.
            </p>
            <p>
              Para ejercer tus derechos o consultar esta política: escríbenos al correo o WhatsApp de contacto que figure en la web.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              8. Seguridad
            </h2>
            <p>
              Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o alteración. Los pagos se realizan a través de plataformas certificadas (Wompi).
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E8E6E1] mb-3">
              9. Cambios
            </h2>
            <p>
              Podemos actualizar esta política de privacidad. La versión vigente estará siempre en esta página, con indicación de la última actualización. Te recomendamos revisarla de vez en cuando.
            </p>
          </section>
        </div>

        <div className="mt-14 pt-8 border-t border-[#E8E6E1]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[#E8E6E1]/70 hover:text-[#E8E6E1] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
