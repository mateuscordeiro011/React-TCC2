import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import Navbar from "../../components/Header/NavbarFuncionario";
import Footer from "../../components/Footer/Footer";
import "./Home.css"; 

export default function HomeFuncionario() {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    produtos: 0,
    animais: 0,
    doacoes: 0,
    clientes: 0,
  });

  // 🔁 Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [produtosRes, animaisRes, doacoesRes, clientesRes] = await Promise.all([
          fetch("http://localhost:8080/api-salsi/produtos").then(r => r.json()),
          fetch("http://localhost:8080/api-salsi/animais").then(r => r.json()),
          fetch("http://localhost:8080/api-salsi/doacoes").then(r => r.json()),
          fetch("http://localhost:8080/api-salsi/usuarios?role=CLIENTE").then(r => r.json()),
        ]);

        setStats({
          produtos: Array.isArray(produtosRes) ? produtosRes.length : 0,
          animais: Array.isArray(animaisRes) ? animaisRes.length : 0,
          doacoes: Array.isArray(doacoesRes) ? doacoesRes.length : 0,
          clientes: Array.isArray(clientesRes) ? clientesRes.length : 0,
        });
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      }
    };

    loadStats();
  }, []);

  return (
    <>
      <Navbar />
      <div className={`home ${darkMode ? "dark-mode" : ""}`}>

        <section className="hero-carousel">
          <div className="hero-slide" style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="hero-content" style={{ 
              position: 'relative', 
              textAlign: 'center', 
              background: 'rgba(0,0,0,0.6)', 
              padding: '40px', 
              borderRadius: '16px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <h1>Painel do Funcionário</h1>
              <p>
                Bem-vindo{user?.nome ? `, ${user.nome}` : ''}! 🎯<br />
                <i>Gerencie produtos, animais e doações da instituição.</i>
              </p>
            </div>
          </div>
        </section>

        {/* Seção de Estatísticas */}
        <section className="catalog-section">
          <div className="section-header">
            <h2 className="catalog-title">Resumo Rápido</h2>
          </div>

          <div className="catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            {/* Card de Produtos */}
            <div className="catalog-item" style={{ cursor: 'default' }}>
              <div className="catalog-item-image" style={{ 
                background: darkMode ? '#2a2a2a' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#00b7c2'
              }}>
                📦
              </div>
              <h3 className="catalog-item-title">Produtos</h3>
              <p className="catalog-item-info">
                Total cadastrados: <strong>{stats.produtos}</strong>
              </p>
              <a href="/formproduto" className="catalog-item-button" style={{ marginTop: '10px' }}>
                Gerenciar
              </a>
            </div>

            {/* Card de Animais */}
            <div className="catalog-item" style={{ cursor: 'default' }}>
              <div className="catalog-item-image" style={{ 
                background: darkMode ? '#2a2a2a' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#d4af37'
              }}>
                🐾
              </div>
              <h3 className="catalog-item-title">Animais</h3>
              <p className="catalog-item-info">
                Total registrados: <strong>{stats.animais}</strong>
              </p>
              <a href="/formanimal" className="catalog-item-button" style={{ marginTop: '10px' }}>
                Gerenciar
              </a>
            </div>

            {/* Card de Doações */}
            <div className="catalog-item" style={{ cursor: 'default' }}>
              <div className="catalog-item-image" style={{ 
                background: darkMode ? '#2a2a2a' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#ff6b6b'
              }}>
                ❤️
              </div>
              <h3 className="catalog-item-title">Doações</h3>
              <p className="catalog-item-info">
                Total recebidas: <strong>{stats.doacoes}</strong>
              </p>
              <a href="/formdoacao" className="catalog-item-button" style={{ marginTop: '10px' }}>
                Ver Registro
              </a>
            </div>

            {/* Card de Clientes */}
            <div className="catalog-item" style={{ cursor: 'default' }}>
              <div className="catalog-item-image" style={{ 
                background: darkMode ? '#2a2a2a' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: '#4ecdc4'
              }}>
                👥
              </div>
              <h3 className="catalog-item-title">Clientes</h3>
              <p className="catalog-item-info">
                Ativos: <strong>{stats.clientes}</strong>
              </p>
              <a href="/clientes" className="catalog-item-button" style={{ marginTop: '10px' }}>
                Ver Lista
              </a>
            </div>
          </div>
        </section>

        {/* Seção de Acesso Rápido */}
        <section className="catalog-section" style={{ backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9' }}>
          <div className="section-header">
            <h2 className="catalog-title">Acesso Rápido</h2>
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '20px', 
            padding: '20px' 
          }}>
            <a href="/formproduto" className="view-more-btn" style={{ minWidth: '200px' }}>
              📦 Cadastrar Produto
            </a>
            <a href="/formanimal" className="view-more-btn" style={{ minWidth: '200px' }}>
              🐶 Cadastrar Animal
            </a>
            <a href="/formdoacao" className="view-more-btn" style={{ minWidth: '200px' }}>
              ❤️ Ver Doações
            </a>
            <a href="/relatorios" className="view-more-btn" style={{ minWidth: '200px' }}>
              📊 Relatórios
            </a>
          </div>
        </section>

        {/* Seção de Últimas Atividades */}
        <section className="catalog-section" style={{ backgroundColor: darkMode ? '#1e1e1e' : '#f9f9f9' }}>
          <div className="section-header">
            <h2 className="catalog-title">Últimas Atividades</h2>
          </div>

          <div style={{ 
            background: darkMode ? '#2a2a2a' : '#fff', 
            padding: '30px', 
            borderRadius: '14px', 
            boxShadow: darkMode ? '0 8px 25px rgba(0,0,0,0.4)' : '0 8px 25px rgba(0,0,0,0.1)',
            margin: '0 15px'
          }}>
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: darkMode ? '1px dashed #555' : '1px dashed #ddd' }}>
              <span style={{ color: darkMode ? '#ccc' : '#666', fontSize: '0.9rem' }}>[10/04/2025]</span>
              <span style={{ marginLeft: '10px', color: darkMode ? '#eee' : '#333' }}>Novo produto cadastrado: "Ração Premium"</span>
            </div>
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: darkMode ? '1px dashed #555' : '1px dashed #ddd' }}>
              <span style={{ color: darkMode ? '#ccc' : '#666', fontSize: '0.9rem' }}>[09/04/2025]</span>
              <span style={{ marginLeft: '10px', color: darkMode ? '#eee' : '#333' }}>Doação recebida: Luna (SRD)</span>
            </div>
            <div>
              <span style={{ color: darkMode ? '#ccc' : '#666', fontSize: '0.9rem' }}>[08/04/2025]</span>
              <span style={{ marginLeft: '10px', color: darkMode ? '#eee' : '#333' }}>Animal adotado: Bob (Poodle)</span>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}