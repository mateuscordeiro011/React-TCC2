import Navbar from "../Header/Navbar"; // ou NavbarFuncionario, dependendo do contexto
import Footer from "../Footer/Footer";

export default function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}