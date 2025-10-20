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

  // ✅ Corrigido: toggleTheme
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
      <Link to="/home-funcionario" className="logo">
        <img src={darkMode ? logoLight : logoDark} alt="Logo" id="header-logo" />
      </Link>

      <ul className="menu">
        <li><Link to="/formproduto">Produtos</Link></li>
        <li><Link to="/formanimal">Animais</Link></li>
        <li><Link to="/formdoacao-funcionario">Doações (Ver)</Link></li>
        <li><Link to="/relatorio">Relatórios</Link></li>
      </ul>

      {/* ✅ Corrigido: toggleTheme */}
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
              <Link to="/perfil-funcionario" onClick={() => setDropdownOpen(false)}>
                <i className="fas fa-user-circle"></i> Meu Perfil
              </Link>
            </li>
            <li>
              <Link to="/configuracoes" onClick={() => setDropdownOpen(false)}>
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

      {dropdownOpen && <div className="dropdown-overlay" onClick={toggleDropdown}></div>}
    </nav>
  );
}