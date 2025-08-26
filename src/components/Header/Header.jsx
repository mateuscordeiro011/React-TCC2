import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import logoLight from "../../IMG/logowhite.png";
import logoDark from "../../IMG/logodark.png";
import "../Header/Header.css";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const [nav, setNav] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const checkScroll = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      setHasScroll(documentHeight > windowHeight);
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (!hasScroll) {
        setNav(true);
        return;
      }

      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setNav(false);
      } else {
        setNav(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, hasScroll]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  return (
    <nav
      className={`navbar ${nav ? "visible" : "hidden"} ${darkMode ? "dark" : "light"}`}
      style={{
        background: nav ? (darkMode ? "rgba(20, 20, 20, 0.8)" : "rgba(255, 255, 255, 0.15)") : "transparent",
        color: darkMode ? "#eee" : "#fff",
        backdropFilter: nav ? "blur(10px)" : "none",
        WebkitBackdropFilter: nav ? "blur(10px)" : "none",
        transition: "all 0.4s ease",
      }}
    >
 
      <ScrollLink to="home" smooth={true} duration={500} className="logo">
        <img src={darkMode ? logoLight : logoDark} alt="Logo" id="header-logo" />
      </ScrollLink>

      <div className="search-container">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <input className="menu-btn" type="checkbox" id="menu-btn" />
      <label className="menu-icon" htmlFor="menu-btn">
        <span className="nav-icon"></span>
      </label>

      <ul className="menu">
        <li><ScrollLink to="home" smooth duration={500} offset={-70}>Início</ScrollLink></li>
        <li><ScrollLink to="catalog-section" smooth duration={580} offset={-40}>Catálogo</ScrollLink></li>
        <li><ScrollLink to="adoption-section" smooth duration={500} offset={-70}>Adoção</ScrollLink></li>
      </ul>

      <button className="mode-toggle" onClick={toggleDarkMode} aria-label="Alternar modo escuro">
        <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
      </button>


      <div className="user-icon" onClick={toggleDropdown}>
        <i className="fas fa-user"></i>
        {dropdownOpen && (
          <ul className="dropdown-menu">
            <li><a href="#cart"><i className="fas fa-shopping-cart"></i> Carrinho</a></li>
            <li><a href="#account"><i className="fas fa-user-circle"></i> Conta</a></li>
            <li><a href="#settings"><i className="fas fa-cog"></i> Configurações</a></li>
            <li><a href="#logout"><i className="fas fa-sign-out-alt"></i> Sair</a></li>
          </ul>
        )}
      </div>

      {dropdownOpen && <div className="dropdown-overlay" onClick={toggleDropdown}></div>}
    </nav>
  );
}