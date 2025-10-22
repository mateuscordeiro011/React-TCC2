import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoLight from "../../IMG/logowhite.png";
import logoDark from "../../IMG/logodark.png";
import "../Header/Header.css"; 
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth.jsx"; 

export default function NavbarFuncionario() {
  const [nav, setNav] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

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

  // Fecha todos os menus
  const closeAllMenus = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
    closeAllMenus();
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
      <Link to="/home-funcionario" className="logo" onClick={closeAllMenus}>
        <img src={darkMode ? logoLight : logoDark} alt="Logo" id="header-logo" />
      </Link>

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
        <li><Link to="/formproduto" onClick={closeAllMenus}>Produtos</Link></li>
        <li><Link to="/formanimal" onClick={closeAllMenus}>Animais</Link></li>
        <li><Link to="/formdoacao-funcionario" onClick={closeAllMenus}>Doações (Ver)</Link></li>
        <li><Link to="/relatorio" onClick={closeAllMenus}>Relatórios</Link></li>
      </ul>

      <button 
        className="mode-toggle" 
        onClick={toggleTheme}
        aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
        title={darkMode ? "Modo Claro" : "Modo Escuro"}
      >
        <i className={`fas ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
      </button>

      <div className="user-icon" onClick={toggleDropdown}>
        <i className="fas fa-user-tie"></i>
        {dropdownOpen && (
          <ul className="dropdown-menu">
            <li>
              <Link to="/perfil-funcionario" onClick={closeAllMenus}>
                <i className="fas fa-user-circle"></i> Meu Perfil
              </Link>
            </li>
            <li>
              <Link to="/configuracoes" onClick={closeAllMenus}>
                <i className="fas fa-cog"></i> Configurações
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="dropdown-logout-button">
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </li>
          </ul>
        )}
      </div>

      {(mobileMenuOpen || dropdownOpen) && (
        <div 
          className="overlay" 
          onClick={closeAllMenus}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}
        />
      )}
    </nav>
  );
}