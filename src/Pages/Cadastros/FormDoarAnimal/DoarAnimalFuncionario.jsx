import { useState, useEffect } from "react";
import api from "../../../service/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, PawPrint, CheckCircle, AlertCircle, User } from "lucide-react";
import "./DoarAnimal.css";
import Footer from "../../../components/Footer/Footer";
import NavbarFuncionario from "../../../components/Header/NavbarFuncionario";
import { useAuth } from "../../../utils/useAuth";

const DoarAnimalFuncionario = () => {
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selectedDoacao, setSelectedDoacao] = useState(null);

  const { user, isFuncionario } = useAuth();

  useEffect(() => {
    if (isFuncionario) {
      loadDoacoes();
    }
  }, [isFuncionario]);

  const loadDoacoes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api-salsi/doacoes/disponiveis");
      console.log("Doações recebidas:", response.data);
      
      // Para cada doação, buscar dados do cliente doador
      const doacoesComCliente = await Promise.all(
        response.data.map(async (doacao) => {
          console.log("Processando doação:", doacao.id_animal, "Cliente ID:", doacao.id_cliente_doador);
          
          if (!doacao.id_cliente_doador) {
            console.warn("Doação sem id_cliente_doador:", doacao);
            return {
              ...doacao,
              cliente: { nome: "ID do cliente não informado", email: "N/A" }
            };
          }
          
          try {
            const clienteResponse = await api.get(`/api-salsi/clientes/${doacao.id_cliente_doador}`);
            console.log("Cliente encontrado:", clienteResponse.data);
            return {
              ...doacao,
              cliente: clienteResponse.data
            };
          } catch (error) {
            console.error(`Erro ao buscar cliente ${doacao.id_cliente_doador}:`, error.response?.status, error.response?.data);
            return {
              ...doacao,
              cliente: { nome: "Cliente não encontrado", email: "N/A" }
            };
          }
        })
      );
      
      setDoacoes(doacoesComCliente);
    } catch (error) {
      console.error("Erro ao carregar doações:", error);
      setMessage({ type: "error", text: "Erro ao carregar doações." });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoacao = (doacao) => {
    setSelectedDoacao(doacao);
  };

  const closeModal = () => {
    setSelectedDoacao(null);
  };

  const renderImage = (foto) => {
    if (!foto) return <div className="petshop-no-image">Sem foto</div>;
    return <img src={`data:image/jpeg;base64,${foto}`} alt="Animal" className="petshop-thumb" />;
  };

  const renderClienteImage = (foto) => {
    if (!foto) return <div className="petshop-cliente-avatar"><User size={24} /></div>;
    return <img src={`data:image/jpeg;base64,${foto}`} alt="Cliente" className="petshop-cliente-avatar" />;
  };

  if (!isFuncionario) {
    return (
      <>
        <NavbarFuncionario />
        <div className="petshop-container">
          <div className="petshop-access-denied">
            <h2>Acesso Negado</h2>
            <p>Esta página é restrita a funcionários.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <NavbarFuncionario />
      <div className="petshop-container">
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className={`petshop-alert petshop-alert-${message.type}`}
            >
              {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="petshop-card petshop-full-width"
        >
          <div className="petshop-header">
            <div className="petshop-icon-wrapper">
              <PawPrint className="petshop-icon" />
            </div>
            <h2>Doações de Animais - Painel Funcionário</h2>
          </div>

          {loading ? (
            <div className="petshop-loading">Carregando doações...</div>
          ) : doacoes.length === 0 ? (
            <div className="petshop-empty">Nenhuma doação encontrada.</div>
          ) : (
            <div className="petshop-doacoes-grid">
              {doacoes.map((doacao) => (
                <motion.div
                  key={doacao.id_animal}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="petshop-doacao-card"
                >
                  {renderImage(doacao.foto)}
                  <div className="petshop-doacao-info">
                    <h3>{doacao.nome}</h3>
                    <p><strong>Espécie:</strong> {doacao.especie}</p>
                    <p><strong>Raça:</strong> {doacao.raca || "Não informada"}</p>
                    <p><strong>Status:</strong> {doacao.status}</p>
                    
                    <div className="petshop-cliente-info">
                      <User size={16} />
                      <span><strong>Doador:</strong> {doacao.cliente?.nome || "Carregando..."}</span>
                    </div>
                    {doacao.id_cliente_doador && (
                      <p style={{fontSize: '0.8rem', color: '#999'}}>ID Cliente: {doacao.id_cliente_doador}</p>
                    )}
                    
                    <button
                      onClick={() => handleViewDoacao(doacao)}
                      className="petshop-btn petshop-btn-small"
                    >
                      <Eye size={16} />
                      Ver Detalhes
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Modal de Detalhes */}
        {selectedDoacao && (
          <div className="petshop-modal-overlay" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="petshop-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="petshop-modal-close" onClick={closeModal}>×</button>
              
              <div className="petshop-modal-content">
                <h2>{selectedDoacao.nome}</h2>
                {renderImage(selectedDoacao.foto)}
                
                <div className="petshop-modal-details">
                  <p><strong>Espécie:</strong> {selectedDoacao.especie}</p>
                  <p><strong>Raça:</strong> {selectedDoacao.raca || "Não informada"}</p>
                  <p><strong>Sexo:</strong> {selectedDoacao.sexo || "Não informado"}</p>
                  <p><strong>Peso:</strong> {selectedDoacao.peso ? `${selectedDoacao.peso} kg` : "Não informado"}</p>
                  <p><strong>Data de Nascimento:</strong> {selectedDoacao.data_nascimento ? new Date(selectedDoacao.data_nascimento).toLocaleDateString('pt-BR') : "Não informada"}</p>
                  <p><strong>Status:</strong> {selectedDoacao.status}</p>
                  
                  <div className="petshop-cliente-details">
                    <h3>Informações do Doador:</h3>
                    <div className="petshop-cliente-info-with-photo">
                      {renderClienteImage(selectedDoacao.cliente?.foto)}
                      <div className="petshop-cliente-text">
                        <p><strong>Nome:</strong> {selectedDoacao.cliente?.nome}</p>
                        <p><strong>Email:</strong> {selectedDoacao.cliente?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default DoarAnimalFuncionario;