import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";
import promo1 from "../../IMG/promo1.png";
import promo2 from "../../IMG/promo2.png";

export default function Home() {
  const { darkMode } = useTheme();
  const [items, setItems] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Carrossel principal (promoções)
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

  // Carregar produtos
  useEffect(() => {
    fetch("http://localhost:8080/api-salsi/produtos")
      .then((res) => res.json())
      .then((data) => {
        const produtosArray = Array.isArray(data) ? data : [];
        setItems(produtosArray.slice(0, 10)); // Limita a 10 produtos
      })
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);

  // Carregar animais
  useEffect(() => {
    fetch("http://localhost:8080/api-salsi/animais")
      .then((res) => res.json())
      .then((data) => {
        const animaisArray = Array.isArray(data) ? data : [];
        setAnimals(animaisArray.slice(0, 10)); // Limita a 10 animais
      })
      .catch((err) => console.error("Erro ao carregar animais:", err));
  }, []);

  // Função segura para calcular idade
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

  // Funções de modal
  const openProductModal = (product) => setSelectedProduct(product);
  const closeProductModal = () => setSelectedProduct(null);

  const openAnimalModal = (animal) => setSelectedAnimal(animal);
  const closeAnimalModal = () => setSelectedAnimal(null);

  return (
    <div className={`home ${darkMode ? "dark-mode" : "light-mode"}`}>
      {/* Carrossel Principal */}
      <section className="hero-carousel">
        <Slider {...heroSettings}>
          <div className="hero-slide">
            <img src={promo1} alt="Promoção" className="hero-image" />
            <div className="hero-content">
              <h1>Seu Pet Merece o Melhor!</h1>
              <p>Na compra de R$150 em ração, ganhe um brinde especial! 🐕</p>
              <button className="cta-button">APROVEITE!</button>
            </div>
          </div>

          <div className="hero-slide">
            <img src={promo2} alt="KIT INICIAL PARA ADOTANTES" className="hero-image" />
            <div className="hero-content">
              <h1>KIT INICIAL PARA ADOTANTES!</h1>
              <p>
                Adotou um pet? Ganhe 15% de desconto no primeiro kit de produtos. 💙
              </p>
              <button className="cta-button">VER CATÁLOGO</button>
            </div>
          </div>
        </Slider>
      </section>

      {/* Seção de Produtos - Padronizada com Adoção */}
      <section className="catalog-section">
        <div className="section-header">
          <h2 className="catalog-title">Nossos Produtos</h2>
       <a href="/produtos" className="view-more-btn">
            VER MAIS
          </a>
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
                  src={item.foto || "https://via.placeholder.com/200x200?text=Sem+Imagem"}
                  alt={item.nome}
                  className="catalog-item-image"
                />
                <h3 className="catalog-item-title">{item.nome}</h3>
                <p className="catalog-item-price">
                  R$ {item.preco?.toFixed(2)}
                </p>
                <button className="catalog-item-button">Adicionar ao Carrinho</button>
                <i className="fas fa-search zoom-icon"></i>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Seção de Adoção - Já padronizada */}
      <section className="catalog-section adoption-section">
        <div className="section-header">
          <h2 className="catalog-title">Animais para Adoção</h2>
       <a href="/adocao" className="view-more-btn">
            VER MAIS
          </a>
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
                  src={
                    animal.foto || "https://via.placeholder.com/200x200?text=Sem+Imagem"
                  }
                  alt={animal.nome}
                  className="catalog-item-image"
                />
                <h3 className="catalog-item-title">{animal.nome}</h3>
                <p className="catalog-item-info">
                  <strong>Espécie:</strong> {animal.especie}
                  <br />
                  <strong>Raça:</strong> {animal.raca}
                  <br />
                  <strong>Idade:</strong> {calculateAge(animal.data_nascimento)} anos
                  <br />
                  <strong>Peso:</strong> {animal.peso} kg
                  <br />
                  <strong>Sexo:</strong> {animal.sexo}
                </p>
                <button className="catalog-item-button">Quero Adotar</button>
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
              &times;
            </button>
            <img
              src={selectedProduct.foto}
              alt={selectedProduct.nome}
              className="modal-image"
            />
            <h2>{selectedProduct.nome}</h2>
            <p className="modal-desc">{selectedProduct.descricao}</p>
            <p className="modal-price">R$ {selectedProduct.preco?.toFixed(2)}</p>
            <div className="modal-actions">
              <button className="modal-btn buy">Comprar Agora</button>
              <button className="modal-btn cart">Adicionar ao Carrinho</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Animal */}
      {selectedAnimal && (
        <div className="modal-overlay" onClick={closeAnimalModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAnimalModal}>
              &times;
            </button>
            <img
              src={selectedAnimal.foto}
              alt={selectedAnimal.nome}
              className="modal-image"
            />
            <h2>{selectedAnimal.nome}</h2>
            <p className="modal-desc">
              <strong>Espécie:</strong> {selectedAnimal.especie}
              <br />
              <strong>Raça:</strong> {selectedAnimal.raca}
              <br />
              <strong>Idade:</strong> {calculateAge(selectedAnimal.data_nascimento)} anos
              <br />
              <strong>Peso:</strong> {selectedAnimal.peso} kg
              <br />
              <strong>Sexo:</strong> {selectedAnimal.sexo}
              <br />
              <strong>Nasceu em:</strong>{" "}
              {new Date(selectedAnimal.data_nascimento).toLocaleDateString("pt-BR")}
            </p>
            <div className="modal-actions">
              <button className="modal-btn adopt">Iniciar Adoção</button>
              <button className="modal-btn info">Saber Mais</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}