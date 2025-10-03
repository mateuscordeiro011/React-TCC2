import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import { useProducts } from "../../hooks/useProducts";
import ProdutoCard from "../../components/ProdutoCard/ProdutoCard";
import ProductModal from "../../components/ProductModal/ProductModal";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import "./CatalogoProdutos.css";
import Navbar from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";

export default function CatalogoProdutos() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const { items, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    categoria: "",
    precoMin: "",
    precoMax: "",
    searchTerm: ""
  });
  const [sortOption, setSortOption] = useState("nome");

  const handleAddToCart = (item) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    console.log("Adicionando ao carrinho:", item.nome);
    // Aqui você pode adicionar ao carrinho real
  };

  const handleViewDetails = (product) => {
    // Navegar para a página de detalhes
    navigate(`/produto/${product.id_produto || product.id}`);
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Função para comprar agora
  const handleBuyNow = (product) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Navegar para a página de checkout com o produto selecionado
    navigate('/checkout', { 
      state: { 
        products: [{...product, quantity: 1}] 
      } 
    });
  };

  // 🔍 Filtrar e ordenar produtos
  const filteredAndSortedItems = items
    .filter(item => {
      // Filtro por termo de busca
      if (filters.searchTerm && 
          !item.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !item.descricao?.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoria
      if (filters.categoria && item.categoria !== filters.categoria) {
        return false;
      }
      
      // Filtro por preço mínimo
      if (filters.precoMin && item.preco < parseFloat(filters.precoMin)) {
        return false;
      }
      
      // Filtro por preço máximo
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

  return (
    <>
      <Navbar />
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
                    onBuyNow={handleBuyNow} // Adicionado
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
      </div>
      <Footer />
    </>
  );
}