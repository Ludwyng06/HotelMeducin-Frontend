import "@styles/pages.css";

export default function ContactPage() {
  return (
    <main className="contact-page" style={{maxWidth: '900px', margin: '3rem auto', background: 'rgba(255,255,255,0.97)', borderRadius: '1.5rem', boxShadow: '0 6px 32px rgba(0,40,104,0.10)', padding: '3rem', fontSize: '1.25rem'}}>
      <h1 style={{color: '#002868', marginBottom: '2rem', fontSize: '2.5rem'}}>Contáctanos</h1>
      <p style={{marginBottom: '2rem', fontSize: '1.3rem'}}>¿Tienes dudas o necesitas ayuda? Escríbenos y te responderemos lo antes posible.</p>
      <form className="contacto-form" style={{display: 'flex', flexDirection: 'column', gap: '1.2rem'}}>
        <input type="text" placeholder="Nombre" className="contacto-input" style={{padding: '0.9rem', borderRadius: '0.7rem', border: '1px solid #ccc', fontSize: '1.1rem'}} />
        <input type="email" placeholder="Correo electrónico" className="contacto-input" style={{padding: '0.9rem', borderRadius: '0.7rem', border: '1px solid #ccc', fontSize: '1.1rem'}} />
        <textarea placeholder="Mensaje" className="contacto-input" style={{padding: '0.9rem', borderRadius: '0.7rem', border: '1px solid #ccc', minHeight: '120px', fontSize: '1.1rem'}} />
        <button className="contacto-btn" style={{background: '#002868', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '0.9rem', fontWeight: 600, cursor: 'pointer', fontSize: '1.1rem'}}>Enviar</button>
      </form>
      <div style={{marginTop: '2.5rem', fontSize: '1.1rem', color: '#444'}}>
        <p><strong>Hotel Meducin</strong></p>
        <p>📍 Av. Principal #123, Ciudad</p>
        <p>📞 +123 456 789</p>
        <p>✉️ contacto@meducin.com</p>
      </div>
    </main>
  );
}