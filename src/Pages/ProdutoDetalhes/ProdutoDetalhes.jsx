// src/Pages/ProdutoDetalhes.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { getBase64ImageSrc } from "../../utils/imageUtils";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import "./ProdutoDetalhes.css";
import Footer from "../../components/Footer/Footer";

export default function ProdutoDetalhes() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // 🔁 Carregar dados do produto
  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        if (!id) {
          setError("ID do produto não fornecido.");
          return;
        }
        
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api-salsi/produtos/${id}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Erro ao carregar detalhes do produto:", err);
        setError("Falha ao carregar detalhes do produto. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    console.log(`Adicionando ${quantity}x ${product.nome} ao carrinho`);
    // Aqui você pode adicionar ao carrinho real
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    console.log("Comprando agora:", product.nome);
    // Implementar lógica de compra imediata
  };

  const handleBack = () => {
    navigate('/catalogo-produto');
  };

  if (loading) {
    return (
      <>

        <div className={`produto-detalhes-page ${darkMode ? "dark-mode" : "light-mode"}`}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando detalhes do produto...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>

        <div className={`produto-detalhes-page ${darkMode ? "dark-mode" : "light-mode"}`}>
          <div className="error-container">
            <p className="error-message">⚠️ {error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>

        <div className={`produto-detalhes-page ${darkMode ? "dark-mode" : "light-mode"}`}>
          <div className="error-container">
            <p className="error-message">Produto não encontrado.</p>
            <button 
              className="retry-button"
              onClick={handleBack}
            >
              Voltar ao catálogo
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Dados de exemplo para demonstração
  const rating = product.rating || 4.5;
  const ratingStars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`rating-star ${i < Math.floor(rating) ? 'filled' : ''}`}>
      ★
    </span>
  ));

  const suppliers = [
    { name: "PetMart", location: "São Paulo", rating: 4.8 },
    { name: "AnimalCare", location: "Rio de Janeiro", rating: 4.5 },
    { name: "PetStore", location: "Brasília", rating: 4.9 }
  ];

  const comments = [
    { user: "Ana Silva", text: "Excelente qualidade! Recomendo para todos os cães.", rating: 5, date: "2025-04-15" },
    { user: "Carlos Oliveira", text: "Ração muito saborosa e nutritiva. Meu cachorro adorou!", rating: 4, date: "2025-04-12" },
    { user: "Maria Souza", text: "Boa relação custo-benefício. Vou comprar novamente.", rating: 5, date: "2025-04-10" }
  ];

  const technicalDetails = [
    { label: "Peso", value: product.peso || "15kg" },
    { label: "Composição", value: product.composicao || "Proteínas de alta qualidade, vitaminas e ômega-3" },
    { label: "Idade recomendada", value: product.idade_recomendada || "Cães adultos" },
    { label: "Tamanho", value: product.tamanho || "Grande" },
    { label: "Sabor", value: product.sabor || "Carne" }
  ];

  return (
    <>
      <div className={`produto-detalhes-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        {/* Hero Section */}
        <section className="produto-hero">
          <div className="hero-content">
            <h1>📦 Detalhes do Produto</h1>
            <p>Informações completas sobre este produto</p>
          </div>
        </section>

        {/* Conteúdo Principal */}
        <section className="produto-details-container">
          <div className="details-left">
            {/* Imagem do Produto */}
            <div className="prod-image-container">
              <img
                src={getBase64ImageSrc(product.foto)}
                alt={product.nome}
                className="prod-image"
                onError={(e) => {
                  e.target.src = "image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                }}
              />
            </div>
          </div>

          <div className="details-right">
            {/* Nome e Categoria */}
            <div className="prod-info">
              <h2 className="prod-name">{product.nome}</h2>
              <p className="prod-category">{product.categoria || "Sem categoria"}</p>
            </div>

            {/* Preço */}
            <div className="prod-price">
              <p>R$ {product.preco?.toFixed(2)}</p>
            </div>

            {/* Quantidade */}
            <div className="prod-quantity">
              <label>Quantidade:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="prod-actions">
              <button
                className="btn-add-to-cart"
                onClick={handleAddToCart}
              >
                🛒 Adicionar ao Carrinho
              </button>
              <button
                className="btn-buy-now"
                onClick={handleBuyNow}
              >
                💳 Comprar Agora
              </button>
            </div>

            {/* Estrelas e Avaliação */}
            <div className="prod-rating">
              <div className="rating-stars">
                {ratingStars}
              </div>
              <p className="rating-count">({rating.toFixed(1)}) - {comments.length} avaliações</p>
            </div>

            {/* Descrição completa */}
            <div className="prod-description">
              <h3>Descrição</h3>
              <p>{product.descricao || "Descrição não disponível."}</p>
            </div>

            {/* Detalhes Técnicos */}
            <div className="prod-tech-details">
              <h3>Detalhes Técnicos</h3>
              <ul>
                {technicalDetails.map((detail, index) => (
                  <li key={index}>
                    <strong>{detail.label}:</strong> {detail.value}
                  </li>
                ))}
              </ul>
            </div>

            {/* Fornecedores */}
            <div className="prod-suppliers">
              <h3>Fornecedores</h3>
              <div className="suppliers-list">
                {suppliers.map((supplier, index) => (
                  <div key={index} className="supplier-item">
                    <h4>{supplier.name}</h4>
                    <p>{supplier.location}</p>
                    <div className="supplier-rating">
                      <span className="rating-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`rating-star ${i < Math.floor(supplier.rating) ? 'filled' : ''}`}>
                            ★
                          </span>
                        ))}
                      </span>
                      <span className="rating-count">({supplier.rating})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comentários */}
            <div className="prod-comments">
              <h3>Comentários ({comments.length})</h3>
              <div className="comments-list">
                {comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-date">{comment.date}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-rating">
                      <span className="rating-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`rating-star ${i < comment.rating ? 'filled' : ''}`}>
                            ★
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      
      {/* Modal de Login */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}