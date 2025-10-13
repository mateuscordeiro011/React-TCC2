import { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import logoLight from "../../IMG/logowhite.png";
import logoDark from "../../IMG/logodark.png";
import "../Header/Header.css";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth.jsx";
import api from "../../service/api";

export default function Navbar() {
  const [nav, setNav] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasScroll, setHasScroll] = useState(false);
  const [navbarSearchQuery, setNavbarSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

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

  const handleNavbarSearch = (e, searchTerm = navbarSearchQuery) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const animalKeywords = ['cachorro', 'gato', 'cão', 'felino', 'canino', 'pet', 'animal', 'adoção', 'adotar'];
      
      if (animalKeywords.some(keyword => query.includes(keyword))) {
        navigate(`/catalogo-adocao?search=${encodeURIComponent(searchTerm)}`);
      } else {
        navigate(`/catalogo-produto?search=${encodeURIComponent(searchTerm)}`);
      }
      setShowSuggestions(false);
      setNavbarSearchQuery("");
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const [productsRes, animalsRes] = await Promise.allSettled([
        api.get('/api-salsi/produtos'),
        api.get('/api-salsi/animais')
      ]);

      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const animals = animalsRes.status === 'fulfilled' ? animalsRes.value.data : [];

      const productSuggestions = products
        .filter(p => p.nome?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(p => ({ name: p.nome, type: 'produto', icon: 'fas fa-box' }));

      const animalSuggestions = animals
        .filter(a => a.nome?.toLowerCase().includes(query.toLowerCase()) || 
                    a.especie?.toLowerCase().includes(query.toLowerCase()) ||
                    a.raca?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(a => ({ name: a.nome || `${a.especie} ${a.raca}`, type: 'animal', icon: 'fas fa-paw' }));

      setSuggestions([...productSuggestions, ...animalSuggestions]);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNavbarSearchQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    handleNavbarSearch(null, suggestion.name);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleNavbarSearch} className="navbar-search-form">
          <input
            type="text"
            placeholder="Pesquisar produtos e animais..."
            value={navbarSearchQuery}
            onChange={handleInputChange}
            onFocus={() => navbarSearchQuery.length >= 2 && setShowSuggestions(true)}
            className="navbar-search-input"
          />
          {showSuggestions && (
            <div className="search-suggestions" ref={suggestionsRef}>
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <i className={`suggestion-icon ${suggestion.icon}`}></i>
                    <span className="suggestion-text">{suggestion.name}</span>
                    <span className="suggestion-type">{suggestion.type}</span>
                  </div>
                ))
              ) : (
                <div className="no-suggestions">
                  Nenhuma sugestão encontrada
                </div>
              )}
            </div>
          )}
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