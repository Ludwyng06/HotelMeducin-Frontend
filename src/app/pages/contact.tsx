import Navbar from "@components/Navbar";
import Footer from "@components/Footer";

export default function Contact() {
  return (
    <div>
      <Navbar />
      <section className="p-8">
        <h2 className="text-2xl font-bold">Contacto</h2>
        <p className="mt-4 text-gray-700">Puedes contactarnos por email o teléfono.</p>
      </section>
      <Footer />
    </div>
  );
}