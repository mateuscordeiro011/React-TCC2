import { useState, useEffect } from "react";
import { useAuth } from "../../utils/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import Footer from "../../components/Footer/Footer";
import "./Carrinho.css";

export default function Carrinho() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item.id_produto !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    const updated = cartItems.map(item =>
      item.id_produto === id ? { ...item, quantidade: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleFinalizarPedido = async () => {
    if (!user) {
      alert("Você precisa estar logado para finalizar o pedido.");
      return;
    }
    if (cartItems.length === 0) {
      setMessage("⚠️ Seu carrinho está vazio.");
      return;
    }

    setLoading(true);
    setMessage("");

    // ⚠️ TEMPORÁRIO: sem animal. Você pode adicionar depois.
    const pedidoData = {
      id_usuario: user.id,
      // id_animal será adicionado depois
      itens: cartItems.map(item => ({
        id_produto: item.id_produto,
        quantidade: item.quantidade
      }))
    };

    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoData),
      });

      if (response.ok) {
        localStorage.removeItem("cart");
        setCartItems([]);
        setMessage("✅ Pedido realizado com sucesso!");
        setTimeout(() => navigate("/pedido-confirmado"), 1500);
      } else {
        const error = await response.text();
        setMessage(`❌ Erro ao criar pedido: ${error}`);
      }
    } catch (err) {
      setMessage(`❌ Erro de conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

    // Tratar imagens Base64 
  const getBase64ImageSrc = (imageData) => {
    // Imagem SVG fallback
    const fallbackSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";

    if (!imageData) {
      console.warn("getBase64ImageSrc: imageData é null/undefined");
      return fallbackSVG;
    }

    const imageDataStr = String(imageData).trim();

    if (imageDataStr === "") {
      console.warn("getBase64ImageSrc: imageData é string vazia");
      return fallbackSVG;
    }

    if (imageDataStr.startsWith('data:image/')) {
      return imageDataStr;
    }

    if (imageDataStr.startsWith('http://') || imageDataStr.startsWith('https://')) {
       console.warn("getBase64ImageSrc: Recebido uma URL em vez de Base64:", imageDataStr);
       return fallbackSVG;
    }

    if (imageDataStr.startsWith("iVBOR")) {
      // PNG
      return `data:image/png;base64,${imageDataStr}`;
    }
    if (imageDataStr.startsWith("R0lGO")) {
      // GIF
      return `data:image/gif;base64,${imageDataStr}`;
    }
    if (imageDataStr.startsWith("/9j/")) {
      // JPEG
      return `data:image/jpeg;base64,${imageDataStr}`;
    }

    // 5. Tentativa padrão como JPEG com validação
    try {
      // Tenta validar a string Base64
      // atob só lança erro se tiver caracteres inválidos ou padding errado
      atob(imageDataStr);
      // Se passou, assume como JPEG
      console.log("getBase64ImageSrc: Usando imagem Base64 como JPEG");
      return `data:image/jpeg;base64,${imageDataStr}`;
    } catch (e) {
      console.error("getBase64ImageSrc: Base64 inválido, usando fallback:", e.message, "Dados recebidos (primeiros 50 chars):", imageDataStr.substring(0, 50));
      return fallbackSVG;
    }
  };


  const total = cartItems.reduce((sum, item) => sum + item.preco * item.quantidade, 0);

  return (
    <>
      <div className={`carrinho-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="carrinho-container">
          <h1 className="carrinho-title">🛒 Meu Carrinho</h1>

          {message && (
            <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h2>Seu carrinho está vazio!</h2>
              <p>Adicione produtos para continuar com sua compra.</p>
              <button onClick={() => navigate("/catalogo-produto")} className="btn-primary">
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items-section">
                <h2 className="section-title">Itens no Carrinho</h2>
                <div className="cart-items-list">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id_produto}
                      className="cart-item-card"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="cart-item-image-wrapper">
                        <img
                          src={getBase64ImageSrc(item.foto)}
                          alt={item.nome}
                          className="cart-item-image"
                        />
                      </div>
                      <div className="cart-item-details">
                        <h3 className="item-name">{item.nome}</h3>
                        <p className="item-description">
                          {item.descricao?.length > 80
                            ? item.descricao.substring(0, 80) + "..."
                            : item.descricao || "Sem descrição"}
                        </p>
                        <div className="item-price">
                          R$ {item.preco.toFixed(2)}
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id_produto, item.quantidade - 1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantidade}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id_produto, item.quantidade + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.id_produto)}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo do Pedido */}
              <div className="cart-summary-section">
                <div className="summary-card">
                  <h2 className="summary-title">Resumo do Pedido</h2>
                  <div className="summary-row">
                    <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantidade, 0)} itens):</span>
                    <strong>R$ {total.toFixed(2)}</strong>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <strong className="total-amount">R$ {total.toFixed(2)}</strong>
                  </div>
                  <button
                    className="btn-finalizar"
                    onClick={handleFinalizarPedido}
                    disabled={loading}
                  >
                    {loading ? "Processando..." : "Finalizar Compra"}
                  </button>
                  <p className="secure-checkout">🔒 Compra segura e criptografada</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}