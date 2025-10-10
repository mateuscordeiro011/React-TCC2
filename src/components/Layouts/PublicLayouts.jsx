import NavbarPublico from "../Header/NavbarPublico";
import Footer from "../Footer/Footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <NavbarPublico />
      <main>{children}</main>
    </>
  );
}