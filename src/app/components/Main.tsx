"use client";
import "../styles/Main.css";
import Link from "next/link";
import Image from "next/image";

const Main = () => {
  return (
    <main className="main">
      <section className="hero">
        <h1>Bienvenido a Hotel Meducin</h1>
        <p>Una experiencia de lujo, comodidad y hospitalidad en cada rincón.</p>

        {/* Imagen de la piscina */}
        <Image
          src="/images/foto piscina.avif"
          alt="Piscina del hotel"
          className="hero-img"
          width={800}
          height={600}
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />

        {/* Texto promocional */}
        <div className="texto-promocional">
          <h2>¿Sueña con los días más cálidos? Su estadía comienza aquí.</h2>
          <p>
            Su escapada en climas cálidos está más cerca de lo que cree. Los
            días soleados, la vista a la piscina y los momentos inolvidables lo
            esperan con Meducin.
          </p>
        </div>

        <Link href="/reservations" className="btn-reserva">
          Reserva Ahora
        </Link>
      </section>

      {/* Nueva sección de destinos */}
      <section className="destinos">
        <h2>Descubra un lugar nuevo</h2>
        <p className="destinos-subtitulo">
          Eche un vistazo a nuestros principales destinos y emprenda una nueva
          aventura.
        </p>

        <div className="destinos-grid">
          <div className="destino-card">
            <img
              src="/images/Cancun.jpg"
              alt="Cancún"
              className="destino-img"
            />
            <h3>Cancún</h3>
          </div>

          <div className="destino-card">
            <img
              src="/images/Cartagena.jpg"
              alt="Cartagena"
              className="destino-img"
            />
            <h3>Cartagena</h3>
          </div>

          <div className="destino-card">
            <img
              src="/images/Las vegas.jpg"
              alt="Las Vegas"
              className="destino-img"
            />
            <h3>Las Vegas</h3>
          </div>

          <div className="destino-card">
            <img src="/images/Tulum.jpg" alt="Tulum" className="destino-img" />
            <h3>Tulum</h3>
          </div>

          <div className="destino-card">
            <img src="/images/Aruba.jpg" alt="Aruba" className="destino-img" />
            <h3>Aruba</h3>
          </div>
        </div>
      </section>
      <section className="features">
        <div className="feature-card">
          <h2>Habitaciones Exclusivas</h2>
          <p>Elegancia y confort con vistas impresionantes.</p>
        </div>
        <div className="feature-card">
          <h2>Spa & Bienestar</h2>
          <p>
            Relájate con nuestros tratamientos de spa y servicios de bienestar.
          </p>
        </div>
        <div className="feature-card">
          <h2>Gastronomía Gourmet</h2>
          <p>
            Disfruta de una experiencia culinaria única en nuestros
            restaurantes.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Main;
