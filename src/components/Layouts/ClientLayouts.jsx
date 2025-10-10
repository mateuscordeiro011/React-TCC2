import Navbar from "../Header/Header"; // seu Navbar normal de cliente
import Footer from "../Footer/Footer";

export default function ClienteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}