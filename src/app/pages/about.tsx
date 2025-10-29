import Navbar from "@components/Navbar";
import Footer from "@components/Footer";

export default function About() {
  return (
    <div>
      <Navbar />
      <section className="p-8">
        <h2 className="text-2xl font-bold">Sobre Nosotros</h2>
        <p className="mt-4 text-gray-700">Somos un hotel de lujo con años de experiencia brindando comodidad.</p>
      </section>
      <Footer />
    </div>
  );
}