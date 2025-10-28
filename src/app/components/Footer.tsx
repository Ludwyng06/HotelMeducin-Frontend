"use client";
import "../styles/Footer.css";

const Footer = () => {

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Información del Hotel */}
        <div className="footer-section">
          <h2>Hotel Meducin</h2>
          <p>Tu mejor experiencia de lujo y confort.</p>
          <p>📍 Dirección: Av. Principal #123, Ciudad</p>
          <p>📞 Teléfono: +123 456 789</p>
          <p>✉️ Email: contacto@meducin.com</p>
        </div>

        {/* Enlaces Rápidos */}
        <div className="footer-section">
          <h2>Enlaces</h2>
          <ul>
            <li>
              <a href="/about">Sobre Nosotros</a>
            </li>
            <li>
              <a href="/rooms">Habitaciones</a>
            </li>
            <li>
              <a href="/services">Servicios</a>
            </li>
            <li>
              <a href="/contact">Contacto</a>
            </li>
          </ul>
        </div>

        {/* Redes Sociales */}
        <div className="footer-section">
          <h2>Síguenos</h2>
          <div className="social-links">
            <a href="#">🌍 Facebook</a>
            <a href="#">🐦 Twitter</a>
            <a href="#">📸 Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Hotel Meducin. Todos los derechos
        reservados.
      </div>
    </footer>
  );
};

export default Footer;
