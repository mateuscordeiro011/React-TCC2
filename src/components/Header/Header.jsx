import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import logoLight from "../../IMG/logowhite.png";
import logoDark from "../../IMG/logodark.png";
import "../Header/Header.css";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth.jsx";

export default function Navbar() {
  const [nav, setNav] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [navbarSearchQuery, setNavbarSearchQuery] = useState("");

  // ✅ Corrigido: toggleTheme em vez de toggleDarkMode
  const { darkMode, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
  };

  const handleNavbarSearch = (e) => {
    e.preventDefault();
    if (navbarSearchQuery.trim()) {
      navigate(`/catalogo-produto?search=${encodeURIComponent(navbarSearchQuery)}`);
    }
  };

  return (
    <nav
      className={`navbar ${nav ? "visible" : "hidden"} ${darkMode ? "dark" : "light"}`}
      style={{
        background: nav 
          ? (darkMode ? "rgba(20, 20, 20, 0.8)" : "rgba(255, 255, 255, 0.15)") 
          : "transparent",
        color: darkMode ? "#eee" : "#fff",
        backdropFilter: nav ? "blur(10px)" : "none",
        WebkitBackdropFilter: nav ? "blur(10px)" : "none",
        transition: "all 0.4s ease",
      }}
    >
      <RouterLink to="/" className="logo">
        {/* ✅ Correto: modo escuro → logo claro */}
        <img src={darkMode ? logoLight : logoDark} alt="Logo" id="header-logo" />
      </RouterLink>

      <div className="search-container">
        <form onSubmit={handleNavbarSearch} className="navbar-search-form">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={navbarSearchQuery}
            onChange={(e) => setNavbarSearchQuery(e.target.value)}
            className="navbar-search-input"
          />
        </form>
      </div>

      <input className="menu-btn" type="checkbox" id="menu-btn" />
      <label className="menu-icon" htmlFor="menu-btn">
        <span className="nav-icon"></span>
      </label>

      <ul className="menu">
        <li><RouterLink to="/">Início</RouterLink></li>
        <li><RouterLink to="/catalogo-produto">Produtos</RouterLink></li>
        <li><RouterLink to="/catalogo-adocao">Animais</RouterLink></li>
        <li><RouterLink to="/formdoacao">Doações</RouterLink></li>
      </ul>

      {/* ✅ Corrigido: onClick={toggleTheme} */}
      <button 
        className="mode-toggle" 
        onClick={toggleTheme} 
        aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        title={darkMode ? "Modo Claro" : "Modo Escuro"}
      >
        <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
      </button>

      <div className="user-icon" onClick={toggleDropdown}>
        <i className="fas fa-user"></i>
        {dropdownOpen && (
          <ul className="dropdown-menu">
            <li>
              <RouterLink to="/carrinho" onClick={() => setDropdownOpen(false)}>
                <i className="fas fa-shopping-cart"></i> Carrinho
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/perfil-cliente" onClick={() => setDropdownOpen(false)}>
                <i className="fas fa-user-circle"></i> Conta
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/configuracoes" onClick={() => setDropdownOpen(false)}>
                <i className="fas fa-cog"></i> Configurações
              </RouterLink>
            </li>
            <li>
              <button onClick={handleLogout} className="dropdown-logout-button">
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </li>
          </ul>
        )}
      </div>

      {dropdownOpen && <div className="dropdown-overlay" onClick={toggleDropdown}></div>}
    </nav>
  );
}