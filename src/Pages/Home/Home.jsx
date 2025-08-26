import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Home.css";
import Navbar from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import promo1 from "../../IMG/promo1.png";
import promo2 from "../../IMG/promo2.jpg";
import promo3 from "../../IMG/promo3.jpg";
import promo4 from "../../IMG/promo4.jpg";
import promo5 from "../../IMG/promo5.jpg";
import promo6 from "../../IMG/promo6.jpg";

export default function Home() {
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

  useEffect(() => {
    fetch("http://localhost:8080/api-salsi/produtos")
      .then((res) => res.json())
      .then((data) => {
        const produtosArray = Array.isArray(data) ? data : [];
        setItems(produtosArray.slice(0, 5));
      })
      .catch((err) => console.error("Erro ao carregar produtos:", err));
  }, []);


  useEffect(() => {
    fetch("http://localhost:8080/api-salsi/animais")
      .then((res) => res.json())
      .then((data) => {
        const animaisArray = Array.isArray(data) ? data : [];
        setAnimals(animaisArray.slice(0, 5));
      })
      .catch((err) => console.error("Erro ao carregar animais:", err));
  }, []);

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

  const getBase64ImageSrc = (base64, defaultSrc) => {
  if (!base64) return defaultSrc;

  if (base64.startsWith("iVBOR")) return `data:image/png;base64,${base64}`;
  if (base64.startsWith("R0lGO")) return `data:image/gif;base64,${base64}`;
  return `data:image/jpeg;base64,${base64}`;
};


  return (
    <>
      <Navbar />
      <div className={`home ${darkMode ? "dark-mode" : "light-mode"}`}>
        <section className="hero-carousel">
          <Slider {...heroSettings}>
            <div className="hero-slide">
              <img src={promo1} alt="Promoção" className="hero-image" />
              <div className="hero-content">
                <h1>ADOÇÃO</h1>
                <p>Adote um novo amigo e faça parte de uma comunidade que ama animais. 🐶🐱✨<br /><i>"Dê um lar amoroso a um animal que precisa de você!"</i></p>
                <button className="cta-button">ADOTAR</button>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo2} alt="KIT INICIAL PARA ADOTANTES" className="hero-image" />
              <div className="hero-content">
                <h1>BAIXE JÁ!</h1>
                <p>Disponível para Android e iOS, baixe nosso app agora mesmo! 📱🐶🐱<br /><i>"Tudo o que você precisa para cuidar do seu pet, no conforto da sua mão."</i></p>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo3} alt="KIT INICIAL PARA ADOTANTES" className="hero-image" />
              <div className="hero-content">
                <h1>APENAS NO APP</h1>
                <p>Até 15% de cashback exclusivo para compras no nosso aplicativo. 💰🐾<br /><i>"Faça suas compras pelo app e ganhe recompensas extras!"</i></p>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo4} alt="KIT INICIAL PARA ADOTANTES" className="hero-image" />
              <div className="hero-content">
                <h1>PRIMEIRA COMPRA</h1>
                <p>60% OFF na sua primeira compra! Válido até 28/11. 🐾🦎🐱🐶<br /><i>"Comece com um grande desconto e aproveite nossos produtos incríveis!"</i></p>
                <button className="cta-button">VER CATÁLOGO</button>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo5} alt="KIT INICIAL PARA ADOTANTES" className="hero-image" />
              <div className="hero-content">
                <h1>PROMOÇÕES</h1>
                <p>Apenas no app: até 90% de desconto em produtos selecionados. 🐢🐠🐱🐶<br /><i>"Ofertas imperdíveis só para quem usa o nosso aplicativo!"</i></p>
                <button className="cta-button">NÃO PERCA!</button>
              </div>
            </div>

            <div className="hero-slide">
              <img src={promo6} alt="KIT INICIAL PARA ADOTANTES" className="hero-image" />
              <div className="hero-content">
                <h1>FRETE GRÁTIS</h1>
                <p>Produtos com até 50% de desconto. 🐶🐱🐾<br /><i>"Compre agora e economize ainda mais com frete grátis e ótimos descontos!"</i></p>
                <button className="cta-button">APROVEITE!</button>
              </div>
            </div>
          </Slider>
        </section>

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
                      animal.foto
                        ? `data:image/jpeg;base64,${animal.foto}`
                        : "https://via.placeholder.com/200x200?text=Sem+Imagem"
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
                    <strong>Idade:</strong> {calculateAge(animal.nascimento)} anos
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

        {selectedAnimal && (
          <div className="modal-overlay" onClick={closeAnimalModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeAnimalModal}>
                &times;
              </button>
                  <img
                    src={
                      selectedAnimal.foto
                        ? `data:image/jpeg;base64,${selectedAnimal.foto}`
                        : "https://via.placeholder.com/200x200?text=Sem+Imagem"
                    }
                    alt={selectedAnimal.nome}
                    className="catalog-item-image"
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
      <Footer />
    </>
  );
}