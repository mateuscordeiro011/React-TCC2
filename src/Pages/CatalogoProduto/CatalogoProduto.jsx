import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import { useProducts } from "../../hooks/useProducts";
import ProdutoCard from "../../components/ProdutoCard/ProdutoCard";
import ProductModal from "../../components/ProductModal/ProductModal";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import "./CatalogoProdutos.css";
import Footer from "../../components/Footer/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBase64ImageSrc } from "../../utils/imageUtils"; 

export default function CatalogoProdutos() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { items, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    categoria: "",
    precoMin: "",
    precoMax: "",
    searchTerm: searchParams.get('search') || ""
  });
  const [sortOption, setSortOption] = useState("nome");
  
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, searchTerm: searchQuery }));
    }
  }, [searchParams]);

  // Estados para o pop-up de carrinho
  const [showAddToCartPopup, setShowAddToCartPopup] = useState(false);
  const [popupProduct, setPopupProduct] = useState(null);

  const handleAddToCart = (item) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(p => p.id_produto === item.id_produto || p.id_produto === item.id);

    if (existing) {
      existing.quantidade += 1;
    } else {
      cart.push({
        id_produto: item.id_produto || item.id,
        nome: item.nome,
        preco: item.preco,
        foto: item.foto,
        quantidade: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    setPopupProduct(item);
    setShowAddToCartPopup(true);

    setTimeout(() => {
      setShowAddToCartPopup(false);
      setPopupProduct(null);
    }, 3000);
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleBuyNow = (product) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        products: [{...product, quantity: 1}] 
      } 
    });
  };

  const filteredAndSortedItems = items
    .filter(item => {
      if (filters.searchTerm && 
          !item.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !item.descricao?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      if (filters.categoria && item.categoria !== filters.categoria) {
        return false;
      }
      
      if (filters.precoMin && item.preco < parseFloat(filters.precoMin)) {
        return false;
      }
      
      if (filters.precoMax && item.preco > parseFloat(filters.precoMax)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "preco-asc":
          return a.preco - b.preco;
        case "preco-desc":
          return b.preco - a.preco;
        case "nome":
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

  const categorias = [...new Set(items.map(item => item.categoria).filter(Boolean))];

  // Placeholder SVG para imagem inválida
  const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";

  return (
    <>
      <div className={`catalogo-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        {/* Hero Section */}
        <section className="catalogo-hero">
          <div className="hero-content">
            <h1>🛍️ Nosso Catálogo Completo</h1>
            <p>Descubra todos os produtos disponíveis para o seu pet</p>
          </div>
        </section>

        {/* Filtros e Ordenação */}
        <section className="catalogo-filters">
          <div className="filters-container">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={filters.categoria}
                onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                className="filter-select"
              >
                <option value="">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group price-filters">
              <input
                type="number"
                placeholder="Preço mín."
                value={filters.precoMin}
                onChange={(e) => setFilters({...filters, precoMin: e.target.value})}
                className="price-input"
              />
              <input
                type="number"
                placeholder="Preço máx."
                value={filters.precoMax}
                onChange={(e) => setFilters({...filters, precoMax: e.target.value})}
                className="price-input"
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="filter-select"
              >
                <option value="nome">Ordenar por nome</option>
                <option value="preco-asc">Menor preço</option>
                <option value="preco-desc">Maior preço</option>
              </select>
            </div>
          </div>
        </section>

        {/* Resultados */}
        <section className="catalogo-results">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">⚠️ {error}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="no-results">
              <h3>😔 Nenhum produto encontrado</h3>
              <p>Tente ajustar seus filtros de busca</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <p>{filteredAndSortedItems.length} produtos encontrados</p>
              </div>
              
              <div className="catalogo-grid">
                {filteredAndSortedItems.map((item) => (
                  <ProdutoCard
                    key={item.id_produto || item.id}
                    product={item}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleOpenModal}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Modal de Visualização Rápida */}
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow} 
        />

        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />

        {/* Pop-up de "Adicionado ao Carrinho" */}
        {showAddToCartPopup && popupProduct && (
          <div className="add-to-cart-popup-overlay">
            <div className="add-to-cart-popup">
              <div className="popup-icon">🛒</div>
              <h3>Produto Adicionado!</h3>
              <div className="popup-product">
                {popupProduct.foto && typeof popupProduct.foto === 'string' && popupProduct.foto.trim() !== '' ? (
                  <img
                    src={getBase64ImageSrc(popupProduct.foto)}
                    alt={popupProduct.nome}
                    className="popup-product-img"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                ) : (
                  <img
                    src={placeholderImage}
                    alt="Sem imagem"
                    className="popup-product-img"
                  />
                )}
                <div>
                  <p className="popup-product-name">{popupProduct.nome}</p>
                  <p className="popup-product-price">R$ {popupProduct.preco.toFixed(2)}</p>
                </div>
              </div>
              <button
                className="popup-view-cart-btn"
                onClick={() => {
                  setShowAddToCartPopup(false);
                  navigate('/carrinho');
                }}
              >
                Ver Carrinho
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}