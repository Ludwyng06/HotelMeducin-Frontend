import "@styles/pages.css";
import Image from "next/image";

export default function AboutPage() {
  return (
    <section className="page">
      <h1>Sobre Nosotros</h1>
      <p>
        Fundado en 2005, <strong>Hotel Meducin</strong> se ha convertido en sinónimo de hospitalidad de lujo en la ciudad. 
        Nuestra visión es crear un espacio donde el confort, el buen gusto y la atención personalizada 
        se encuentren para brindarte una experiencia única.
      </p>

      <h2>Nuestra Filosofía</h2>
      <p>
        Creemos en ofrecer algo más que una habitación. Queremos que cada huésped viva una experiencia completa, 
        desde el momento en que cruza nuestra puerta hasta su regreso a casa.
      </p>

      <h2>Nuestro Compromiso</h2>
      <ul>
        <li>Atención personalizada y multilingüe</li>
        <li>Enfoque ecológico y sostenible en nuestras operaciones</li>
        <li>Apoyo a la comunidad local mediante alianzas y eventos</li>
      </ul>

      <h2>Nuestras Instalaciones</h2>
      <p>
        Contamos con <strong>80 habitaciones</strong>, 3 salones de eventos, spa, piscina climatizada, restaurante gourmet y una terraza con vista panorámica.
      </p>

      {/* Imagen del hotel */}
      <Image
        src="/images/login.jpg"
        alt="Hotel Lobby o Fachada"
        width={800}
        height={500}
        style={{ width: "100%", borderRadius: "10px", marginTop: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </section>
  );
}
