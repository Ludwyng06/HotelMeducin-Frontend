import "../styles/pages.css";
import Image from "next/image";

export default function ServicesPage() {
    return (
      <section className="page">
        <h1>Servicios</h1>
        <p>
          En Hotel Meducin, nos esforzamos por ofrecer servicios integrales para que tu estancia sea perfecta.
        </p>
  
        <div className="service-list" style={{display: 'flex', flexDirection: 'column', gap: '3rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap'}}>
            <Image src="/images/spa y bienestar.jpg" alt="Spa & Wellness" width={420} height={280} style={{maxWidth: '100%', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,40,104,0.13)'}} />
            <div>
              <h2 style={{color: '#002868', fontSize: '2rem', marginBottom: '0.7rem'}}>Spa & Wellness</h2>
              <p style={{fontSize: '1.18rem', color: '#222'}}>Masajes relajantes, tratamientos faciales, jacuzzi y más.<br/>Vive una experiencia de relajación total en nuestro spa de lujo.</p>
            </div>
          </div>
  
          <div style={{display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', flexDirection: 'row-reverse'}}>
            <Image src="/images/restaurante.jpg" alt="Restaurante Sabor Meducin" width={420} height={280} style={{maxWidth: '100%', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,40,104,0.13)'}} />
            <div>
              <h2 style={{color: '#002868', fontSize: '2rem', marginBottom: '0.7rem'}}>Restaurante "Sabor Meducin"</h2>
              <p style={{fontSize: '1.18rem', color: '#222'}}>Menú internacional con ingredientes frescos y opción de menú vegetariano/vegano.<br/>Disfruta de una experiencia gastronómica única.</p>
            </div>
          </div>
  
          <div style={{marginTop: '2rem'}}>
            <h2 style={{color: '#002868', fontSize: '2rem', marginBottom: '0.7rem'}}>Piscina y Terraza</h2>
            <p style={{fontSize: '1.18rem', color: '#222'}}>Perfectas para relajarte, leer o disfrutar del atardecer.</p>
          </div>
          <div>
            <h2 style={{color: '#002868', fontSize: '2rem', marginBottom: '0.7rem'}}>Gimnasio</h2>
            <p style={{fontSize: '1.18rem', color: '#222'}}>Equipado con máquinas de cardio, pesas y zona de yoga.</p>
          </div>
          <div>
            <h2 style={{color: '#002868', fontSize: '2rem', marginBottom: '0.7rem'}}>Centro de Negocios</h2>
            <p style={{fontSize: '1.18rem', color: '#222'}}>Computadoras, impresora, Wi-Fi y espacio coworking 24/7.</p>
          </div>
          <div>
            <h2 style={{color: '#002868', fontSize: '2rem', marginBottom: '0.7rem'}}>Salones para Eventos</h2>
            <p style={{fontSize: '1.18rem', color: '#222'}}>Reuniones corporativas, bodas y eventos sociales.</p>
          </div>
        </div>
      </section>
    );
  }