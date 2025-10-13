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

  const getBase64ImageSrc = (imageData) => {
    const fallbackSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Pz88L3RleHQ+PC9zdmc+";
    if (!imageData) return fallbackSVG;
    const imageDataStr = String(imageData).trim();
    if (imageDataStr === "") return fallbackSVG;
    if (imageDataStr.startsWith('data:image/')) return imageDataStr;
    if (imageDataStr.startsWith('http://') || imageDataStr.startsWith('https://')) return fallbackSVG;
    if (imageDataStr.startsWith("iVBOR")) return `data:image/png;base64,${imageDataStr}`;
    if (imageDataStr.startsWith("R0lGO")) return `data:image/gif;base64,${imageDataStr}`;
    if (imageDataStr.startsWith("/9j/")) return `data:image/jpeg;base64,${imageDataStr}`;
    try {
      atob(imageDataStr);
      return `data:image/jpeg;base64,${imageDataStr}`;
    } catch (e) {
      return fallbackSVG;
    }
  };

  const detectSearchType = (query) => {
    const lowerQuery = query.toLowerCase();
    const animalKeywords = ['cachorro', 'gato', 'cão', 'felino', 'canino', 'pet', 'animal', 'adoção', 'adotar', 'filhote', 'poodle', 'labrador', 'siamês', 'persa', 'vira-lata'];
    const productKeywords = ['ração', 'brinquedo', 'coleira', 'cama', 'comedouro', 'bebedouro', 'shampoo', 'medicamento', 'produto', 'comprar'];
    
    const animalScore = animalKeywords.filter(keyword => lowerQuery.includes(keyword)).length;
    const productScore = productKeywords.filter(keyword => lowerQuery.includes(keyword)).length;
    
    if (animalScore > productScore) return 'animal';
    if (productScore > animalScore) return 'produto';
    return 'ambos';
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const searchType = detectSearchType(query);
      const [productsRes, animalsRes] = await Promise.allSettled([
        api.get('/api-salsi/produtos'),
        api.get('/api-salsi/animais')
      ]);

      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const animals = animalsRes.status === 'fulfilled' ? animalsRes.value.data : [];

      let suggestions = [];

      if (searchType === 'produto' || searchType === 'ambos') {
        const productSuggestions = products
          .filter(p => p.nome?.toLowerCase().includes(query.toLowerCase()) || 
                      p.descricao?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, searchType === 'produto' ? 5 : 3)
          .map(p => ({ 
            name: p.nome, 
            type: 'produto', 
            icon: 'fas fa-box',
            image: getBase64ImageSrc(p.foto),
            price: p.preco,
            data: p
          }));
        suggestions = [...suggestions, ...productSuggestions];
      }

      if (searchType === 'animal' || searchType === 'ambos') {
        const animalSuggestions = animals
          .filter(a => a.nome?.toLowerCase().includes(query.toLowerCase()) || 
                      a.especie?.toLowerCase().includes(query.toLowerCase()) ||
                      a.raca?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, searchType === 'animal' ? 5 : 3)
          .map(a => ({ 
            name: a.nome || `${a.especie} ${a.raca}`, 
            type: 'animal', 
            icon: 'fas fa-paw',
            image: getBase64ImageSrc(a.foto),
            info: `${a.especie} • ${a.raca}`,
            data: a
          }));
        suggestions = [...suggestions, ...animalSuggestions];
      }

      setSuggestions(suggestions);
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
                    <img 
                      src={suggestion.image} 
                      alt={suggestion.name}
                      className="suggestion-image"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+Pz88L3RleHQ+PC9zdmc+";
                      }}
                    />
                    <div className="suggestion-content">
                      <span className="suggestion-text">{suggestion.name}</span>
                      {suggestion.price && (
                        <span className="suggestion-price">R$ {suggestion.price.toFixed(2)}</span>
                      )}
                      {suggestion.info && (
                        <span className="suggestion-info">{suggestion.info}</span>
                      )}
                    </div>
                    <div className="suggestion-meta">
                      <i className={`suggestion-icon ${suggestion.icon}`}></i>
                      <span className="suggestion-type">{suggestion.type}</span>
                    </div>
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