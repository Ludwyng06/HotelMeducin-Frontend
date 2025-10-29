import Image from "next/image";
import Link from "next/link";
import "@styles/pages.css"; // Asegúrate de importar los estilos necesarios

export default function RoomsPage() {
  return (
    <section className="page rooms-page">
      <h1>Habitaciones</h1>
      <p>
        En <strong>Hotel Meducin</strong>, nuestras habitaciones combinan lujo, comodidad y elegancia. Escoge la que mejor se adapte a tu experiencia.
      </p>

      <div className="room-list">
        <div className="room-card">
          <Image
           src="/images/suite-presidencial.jpg"
            alt="Suite Presidencial"
            width={500}
            height={300}
          />
          <h3>Suite Presidencial</h3>
          <p>La joya del hotel. Espaciosa, con terraza privada y vistas panorámicas.</p>
        </div>

        <div className="room-card">
          <Image
            src="/images/suite-ejecutiva.jpg"
            alt="Suite Ejecutiva"
            width={500}
            height={300}
          />
          <h3>Suite Ejecutiva</h3>
          <p>Diseñada para ejecutivos, equipada con zona de trabajo y relajación.</p>
        </div>

        <div className="room-card">
          <Image
            src="/images/habitacion-estandar.jpg"
            alt="Habitación Estándar"
            width={500}
            height={300}
          />
          <h3>Habitación Estándar</h3>
          <p>Cómoda y acogedora. Ideal para estancias cortas o escapadas románticas.</p>
        </div>
      </div>

      <hr style={{ margin: "3rem 0" }} />

      {/* Sección de Reserva */}
      <section className="reservation-section">
        <h2>Reserva tu habitación ahora</h2>
        <p>No pierdas la oportunidad de vivir una experiencia única en Hotel Meducin.</p>
        <Link href="/reservations" className="reserve-button">
          Ir al Formulario de Reservas
        </Link>
      </section>
    </section>
  );
}
