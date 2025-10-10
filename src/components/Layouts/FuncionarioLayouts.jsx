import NavbarFuncionario from "../Header/NavbarFuncionario";
import Footer from "../Footer/Footer";

export default function FuncionarioLayout({ children }) {
  return (
    <>
      <NavbarFuncionario />
      <main>{children}</main>
    </>
  );
}