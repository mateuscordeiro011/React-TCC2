import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "../../IMG/logowhite.png";
import logoDark from "../../IMG/logodark.png";
import "../Header/Header.css";
import { useTheme } from "../../context/ThemeContext";

export default function NavbarPublico() {
  const [nav, setNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Verifica se a página tem scroll
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

  // Controla visibilidade da navbar ao rolar
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

  // Fecha menu ao navegar
  const closeMenu = () => setMobileMenuOpen(false);

  // Função de busca
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo-produto?search=${encodeURIComponent(searchQuery)}`);
      closeMenu();
    }
  };

  return (
    <nav
      className={`navbar ${nav ? "visible" : "hidden"} ${darkMode ? "dark" : "light"}`}
      style={{
        background: nav
          ? darkMode
            ? "rgba(20, 20, 20, 0.8)"
            : "rgba(255, 255, 255, 0.15)"
          : "transparent",
        color: darkMode ? "#eee" : "#fff",
        backdropFilter: nav ? "blur(10px)" : "none",
        WebkitBackdropFilter: nav ? "blur(10px)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <Link to="/" className="logo" onClick={closeMenu}>
        <img src={darkMode ? logoLight : logoDark} alt="Logo" id="header-logo" />
      </Link>

      <div className="search-container">
        <form onSubmit={handleSearch} className="navbar-search-form">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search-input"
          />
        </form>
      </div>

      <input 
        className="menu-btn" 
        type="checkbox" 
        id="menu-btn" 
        checked={mobileMenuOpen}
        onChange={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Alternar menu"
      />
      <label className="menu-icon" htmlFor="menu-btn">
        <span className="nav-icon"></span>
        <span className="nav-icon"></span>
        <span className="nav-icon"></span>
      </label>

      <ul className={`menu ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <li><Link to="/" onClick={closeMenu}>Início</Link></li>
        <li><Link to="/catalogo-produto" onClick={closeMenu}>Produtos</Link></li>
        <li><Link to="/catalogo-adocao" onClick={closeMenu}>Animais</Link></li>
        <li><Link to="/formdoacao" onClick={closeMenu}>Doações</Link></li>
      </ul>

      <button
        className="mode-toggle"
        onClick={toggleTheme}
        aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        title={darkMode ? "Modo Claro" : "Modo Escuro"}
      >
        <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
      </button>

      <div className="auth-buttons">
        <Link to="/login" className="btn-login" onClick={closeMenu}>
          Login
        </Link>
        <Link to="/registro" className="btn-register" onClick={closeMenu}>
          Registrar
        </Link>
      </div>

      {mobileMenuOpen && (
        <div 
          className="overlay" 
          onClick={closeMenu}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}
        />
      )}
    </nav>
  );
}