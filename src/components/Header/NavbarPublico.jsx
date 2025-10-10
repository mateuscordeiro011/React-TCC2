// src/components/Header/NavbarPublico.jsx
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

  // Função de busca
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo-produto?search=${encodeURIComponent(searchQuery)}`);
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
      {/* LOGO */}
      <Link to="/" className="logo">
        <img src={darkMode ? logoLight : logoDark} alt="Logo" id="header-logo" />
      </Link>

      {/* BUSCA */}
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

      {/* MENU HAMBURGUER (mobile) */}
      <input className="menu-btn" type="checkbox" id="menu-btn" />
      <label className="menu-icon" htmlFor="menu-btn">
        <span className="nav-icon"></span>
      </label>

      {/* MENU DE NAVEGAÇÃO */}
      <ul className="menu">
        <li><Link to="/">Início</Link></li>
        <li><Link to="/catalogo-produto">Produtos</Link></li>
        <li><Link to="/catalogo-adocao">Animais</Link></li>
        <li><Link to="/formdoacao">Doações</Link></li>
      </ul>

      {/* BOTÃO DE TEMA */}
      <button
        className="mode-toggle"
        onClick={toggleTheme}
        aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        title={darkMode ? "Modo Claro" : "Modo Escuro"}
      >
        <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
      </button>

      {/* BOTÕES DE LOGIN/REGISTRAR (em vez do ícone de usuário) */}
      <div className="auth-buttons">
        <Link to="/login" className="btn-login">
          Login
        </Link>
        <Link to="/registro" className="btn-register">
          Registrar
        </Link>
      </div>
    </nav>
  );
}