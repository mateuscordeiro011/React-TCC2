import { useState, useEffect } from "react";
import logoLight from "../../IMG/logowhite.png";
import logoDark from "../../IMG/logodark.png";
import { useTheme } from "../../context/ThemeContext";
import "./Footer.css";

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { darkMode } = useTheme(); // ✅ Usa o tema do contexto

  // Mostra/oculta botão "voltar ao topo"
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            {/* Logo */}
            <div className="col col-logo">
              <img
                src={darkMode ? logoLight : logoDark}
                alt="Logo SalsiDogs"
                className="footer-logo"
              />
            </div>

            <div className="col col-links">
              <h3>LINKS ÚTEIS</h3>
              <ul>
                <li><a href="#about">Sobre nós</a></li>
                <li><a href="#delivery">Informação de entrega</a></li>
                <li><a href="#privacy">Política de Privacidade</a></li>
                <li><a href="#terms">Termos e condições</a></li>
                <li><a href="#account">Minha Conta</a></li>
                <li><a href="#orders">Pedidos</a></li>
              </ul>
            </div>

            <div className="col col-account">
              <h3>MINHA CONTA</h3>
              <ul>
                <li><a href="#my-account">Minha Conta</a></li>
                <li><a href="#orders-history">Histórico de Pedidos</a></li>
                <li><a href="#affiliates">Afiliados</a></li>
                <li><a href="#newsletter">Newsletter</a></li>
                <li><a href="#gift-card">Vale Presente</a></li>
              </ul>
            </div>

            <div className="col col-services">
              <h3>SERVIÇOS</h3>
              <ul>
                <li><a href="#contact">Contato</a></li>
                <li><a href="#returns">Devoluções</a></li>
                <li><a href="#sitemap">Mapa do site</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <div className="container">
          <div className="row">
            <div className="col col-socials">
              <a href="#" className="social-icon" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
              <a href="#" className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-icon" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>

            <div className="col col-copyright">
              <p>Copyright © 2025, SalsiDogs, All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Voltar ao Topo */}
      {showBackToTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Voltar ao topo"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}
    </footer>
  );
}