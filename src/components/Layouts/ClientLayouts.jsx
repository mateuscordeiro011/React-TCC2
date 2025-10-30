import Navbar from "../Header/Header"; 
import Footer from "../Footer/Footer";

export default function ClienteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}