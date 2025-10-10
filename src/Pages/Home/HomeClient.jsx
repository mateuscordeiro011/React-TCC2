import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from "../../utils/useAuth";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

import promo1 from "../../IMG/promo1.png";
import promo2 from "../../IMG/promo2.jpg";
import promo3 from "../../IMG/promo3.jpg";
import promo4 from "../../IMG/promo4.jpg";
import promo5 from "../../IMG/promo5.jpg";
import promo6 from "../../IMG/promo6.jpg";

export default function Home() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { darkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    fade: true,
  };

  const handleAddToCart = (item) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    console.log("Adicionando ao carrinho:", item.nome);
    // Aqui você pode adicionar ao carrinho real
  };

  // 🔁 Carregar Produtos
  useEffect(() => {
    fetch("http://localhost:8080/api-salsi/produtos", {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const produtosArray = Array.isArray(data) ? data : [];
        setItems(produtosArray.slice(0, 5));
      })
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);

  // 🔁 Carregar Animais
  useEffect(() => {
    fetch("http://localhost:8080/api-salsi/animais", {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 401) {
          console.warn("Não autorizado: redirecionar para login?");
          setAnimals([]);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const animaisArray = Array.isArray(data) ? data : [];
        setAnimals(animaisArray.slice(0, 5));
      })
      .catch((err) => {
        console.error("Erro ao carregar animais:", err);
        setAnimals([]);
      });
  }, []);

  // Calcular idade
  const calculateAge = (birthDate) => {
    if (!birthDate) return "Desconhecida";

    const dob = new Date(birthDate);
    if (isNaN(dob.getTime())) return "Desconhecida";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  const openProductModal = (product) => setSelectedProduct(product);
  const closeProductModal = () => setSelectedProduct(null);

  const openAnimalModal = (animal) => setSelectedAnimal(animal);
  const closeAnimalModal = () => setSelectedAnimal(null);

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

  return (
    <>
      <div className={`home ${darkMode ? "dark-mode" : "light-mode"}`}>
        {/* Carrossel de Promoções */}
        <section className="hero-carousel">
          <Slider {...heroSettings}>
            <div className="hero-slide">
              <img src={promo1} alt="Adoção" className="hero-image" />
              <div className="hero-content">
                <h1>ADOÇÃO</h1>
                <p>
                  Adote um novo amigo e faça parte de uma comunidade que ama animais. 🐶🐱✨<br />
                  <i>"Dê um lar amoroso a um animal que precisa de você!"</i>
                </p>
                <button className="cta-button">ADOTAR</button>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo2} alt="Baixe o app" className="hero-image" />
              <div className="hero-content">
                <h1>BAIXE JÁ!</h1>
                <p>
                  Disponível para Android e iOS, baixe nosso app agora mesmo! 📱🐶🐱<br />
                  <i>"Tudo o que você precisa para cuidar do seu pet, no conforto da sua mão."</i>
                </p>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo3} alt="Cashback no app" className="hero-image" />
              <div className="hero-content">
                <h1>APENAS NO APP</h1>
                <p>
                  Até 15% de cashback exclusivo para compras no nosso aplicativo. 💰🐾<br />
                  <i>"Faça suas compras pelo app e ganhe recompensas extras!"</i>
                </p>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo4} alt="Primeira compra" className="hero-image" />
              <div className="hero-content">
                <h1>PRIMEIRA COMPRA</h1>
                <p>
                  60% OFF na sua primeira compra! Válido até 28/11. 🐾🦎🐱🐶<br />
                  <i>"Comece com um grande desconto e aproveite nossos produtos incríveis!"</i>
                </p>
                <button className="cta-button">VER CATÁLOGO</button>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo5} alt="Promoções" className="hero-image" />
              <div className="hero-content">
                <h1>PROMOÇÕÕES</h1>
                <p>
                  Apenas no app: até 90% de desconto em produtos selecionados. 🐢🐠🐱🐶<br />
                  <i>"Ofertas imperdíveis só para quem usa o nosso aplicativo!"</i>
                </p>
                <button className="cta-button">NÃO PERCA!</button>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo6} alt="Frete grátis" className="hero-image" />
              <div className="hero-content">
                <h1>FRETE GRÁTIS</h1>
                <p>
                  Produtos com até 50% de desconto. 🐶🐱🐾<br />
                  <i>"Compre agora e economize ainda mais com frete grátis e ótimos descontos!"</i>
                </p>
                <button className="cta-button">APROVEITE!</button>
              </div>
            </div>
          </Slider>
        </section>

        {/* Seção de Produtos */}
        <section className="catalog-section">
          <div className="section-header">
            <h2 className="catalog-title">Nossos Produtos</h2>
            <a href="/catalogo-produto" className="view-more-btn">VER MAIS</a>
          </div>

          {items.length === 0 ? (
            <p className="no-items">Nenhum produto encontrado.</p>
          ) : (
            <div className="catalog-grid">
              {items.map((item) => (
                <div
                  key={item.id_produto || item.id}
                  className="catalog-item"
                  onClick={() => openProductModal(item)}
                >
                  <img
                    src={getBase64ImageSrc(item.foto)}
                    alt={item.nome}
                    className="catalog-item-image"
                    onError={(e) => {
                      // Fallback inline caso a imagem falhe
                      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                    }}
                  />
                  <h3 className="catalog-item-title">{item.nome}</h3>
                  <p className="catalog-item-price">
                    R$ {item.preco?.toFixed(2)}
                  </p>
                  <button
                    className="catalog-item-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    Adicionar ao Carrinho
                  </button>
                  <i className="fas fa-search zoom-icon"></i>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Seção de Adoção */}
        <section className="catalog-section adoption-section">
          <div className="section-header">
            <h2 className="catalog-title">Animais para Adoção</h2>
            <a href="/catalogo-adocao" className="view-more-btn">VER MAIS</a>
          </div>

          {animals.length === 0 ? (
            <p className="no-items">Nenhum animal disponível para adoção.</p>
          ) : (
            <div className="catalog-grid">
              {animals.map((animal) => (
                <div
                  key={animal.id_animal || animal.id}
                  className="catalog-item"
                  onClick={() => openAnimalModal(animal)}
                >
                  <img
                    src={getBase64ImageSrc(animal.foto)}
                    alt={animal.nome}
                    className="catalog-item-image"
                    onError={(e) => {
                      // Fallback inline caso a imagem falhe
                      e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                    }}
                  />
                  <h3 className="catalog-item-title">{animal.nome}</h3>
                  <p className="catalog-item-info">
                    <strong>Espécie:</strong> {animal.especie}<br />
                    <strong>Raça:</strong> {animal.raca}<br />
                    <strong>Idade:</strong> {calculateAge(animal.data_nascimento || animal.nascimento)} anos<br />
                    <strong>Peso:</strong> {animal.peso} kg<br />
                    <strong>Sexo:</strong> {animal.sexo}
                  </p>
                  <button
                    className="catalog-item-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(animal);
                    }}
                  >
                    Quero Adotar
                  </button>
                  <i className="fas fa-search zoom-icon"></i>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal de Produto */}
        {selectedProduct && (
          <div className="modal-overlay" onClick={closeProductModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeProductModal}>
                ×
              </button>
              <img
                src={getBase64ImageSrc(selectedProduct.foto)}
                alt={selectedProduct.nome}
                className="modal-image"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                }}
              />
              <h2>{selectedProduct.nome}</h2>
              <p className="modal-desc">{selectedProduct.descricao}</p>
              <p className="modal-price">R$ {selectedProduct.preco?.toFixed(2)}</p>
              <div className="modal-actions">
                <button className="modal-btn buy">Comprar Agora</button>
                <button
                  className="modal-btn cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(selectedProduct);
                  }}
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Animal */}
        {selectedAnimal && (
          <div className="modal-overlay" onClick={closeAnimalModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeAnimalModal}>
                ×
              </button>
              <img
                src={getBase64ImageSrc(selectedAnimal.foto)}
                alt={selectedAnimal.nome}
                className="modal-image"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                }}
              />
              <h2>{selectedAnimal.nome}</h2>
              <p className="modal-desc">
                <strong>Espécie:</strong> {selectedAnimal.especie}<br />
                <strong>Raça:</strong> {selectedAnimal.raca}<br />
                <strong>Idade:</strong> {calculateAge(selectedAnimal.data_nascimento || selectedAnimal.nascimento)} anos<br />
                <strong>Peso:</strong> {selectedAnimal.peso} kg<br />
                <strong>Sexo:</strong> {selectedAnimal.sexo}<br />
                <strong>Nasceu em:</strong>{" "}
                {new Date(selectedAnimal.data_nascimento || selectedAnimal.nascimento).toLocaleDateString("pt-BR")}
              </p>
              <div className="modal-actions">
                <button className="modal-btn adopt">Iniciar Adoção</button>
                <button className="modal-btn info">Saber Mais</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Login */}
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
      <Footer/>
    </>
  );
}