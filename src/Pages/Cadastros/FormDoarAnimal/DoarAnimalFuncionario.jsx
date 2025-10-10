import { useState, useEffect } from "react";
import api from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, CheckCircle, AlertCircle, PawPrint } from "lucide-react";
import "./DoarAnimal.css";
import Footer from "../../../components/Footer/Footer";
import { getUserRole } from "../../../utils/auth";

const DoarAnimal = () => {
  const [animais, setAnimais] = useState([]);
  const [doacoes, setDoacoes] = useState([]); 
  const [vnome, setNome] = useState("");
  const [vraca, setRaca] = useState("");
  const [vidade, setIdade] = useState("");
  const [vpelagem, setPelagem] = useState("");
  const [vimg, setImg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const userRole = getUserRole(); 

  // Busca animais cadastrados (público)
  useEffect(() => {
    const fetchAnimais = async () => {
      try {
        const res = await api.get("http://localhost:8080/api-salsi/animais");
        setAnimais(res.data);
      } catch (err) {
        console.error("Erro ao buscar animais", err);
        setMessage({ type: "error", text: "Falha ao carregar animais." });
      }
    };
    fetchAnimais();
  }, []);

  // Busca LOG de doações (só se for funcionário)
  useEffect(() => {
    if (userRole === 'FUNCIONARIO') {
      const fetchDoacoes = async () => {
        try {
          const res = await api.get("http://localhost:8080/api-salsi/doacoes");
          setDoacoes(res.data);
        } catch (err) {
          console.error("Erro ao buscar doações", err);
          setMessage({ type: "error", text: "Falha ao carregar histórico de doações." });
        }
      };
      fetchDoacoes();
    }
  }, [userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vnome || !vraca) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post("http://localhost:8080/api-salsi/doacoes", {
        nome: vnome,
        raca: vraca,
        idade: parseInt(vidade),
        pelagem: vpelagem,
        imagem: vimg,
        dataDoacao: new Date().toISOString(), // opcional
      });

      // Atualiza lista local (opcional)
      if (userRole === 'FUNCIONARIO') {
        setDoacoes((prev) => [...prev, response.data]);
      }

      resetForm();
      setMessage({ type: "success", text: "Doação registrada com sucesso!" });
    } catch (error) {
      console.error("Erro ao registrar doação", error);
      setMessage({ type: "error", text: "Erro ao registrar doação." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoacao = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este registro de doação?")) return;

    try {
      await api.delete(`http://localhost:8080/api-salsi/doacoes/${id}`);
      setDoacoes((prev) => prev.filter((d) => d.id !== id));
      setMessage({ type: "success", text: "Registro excluído com sucesso!" });
    } catch (error) {
      console.log("Erro ao deletar doação", error);
      setMessage({ type: "error", text: "Erro ao excluir registro." });
    }
  };

  const resetForm = () => {
    setNome("");
    setRaca("");
    setIdade("");
    setPelagem("");
    setImg("");
  };

  return (
    <>
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

      <div className="petshop-grid">
        {/* FORMULÁRIO DE DOAÇÃO */}
        <motion.section
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="petshop-card petshop-form-card"
        >
          <div className="petshop-header">
            <div className="petshop-icon-wrapper">
              <PawPrint className="petshop-icon" />
            </div>
            <h2>Doar um Animal</h2>
          </div>

          <form onSubmit={handleSubmit} className="petshop-form">
            <div className="petshop-input-group">
              <label>Nome do Animal *</label>
              <input
                type="text"
                value={vnome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Luna"
                required
              />
            </div>

            <div className="petshop-input-group">
              <label>Raça *</label>
              <input
                type="text"
                value={vraca}
                onChange={(e) => setRaca(e.target.value)}
                placeholder="Ex: Vira-lata, SRD, Poodle"
                required
              />
            </div>

            <div className="petshop-input-group">
              <label>Idade (meses)</label>
              <input
                type="number"
                value={vidade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 12"
              />
            </div>

            <div className="petshop-input-group">
              <label>Pelagem</label>
              <input
                type="text"
                value={vpelagem}
                onChange={(e) => setPelagem(e.target.value)}
                placeholder="Ex: Curta, Preta"
              />
            </div>

            <div className="petshop-input-group">
              <label>Foto do Animal</label>
              <div className="petshop-file-upload" onClick={() => document.getElementById('file-input').click()}>
                <PawPrint size={20} />
                <span>{vimg ? "Foto carregada" : "Clique para selecionar foto"}</span>
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setImg(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
              />
              {vimg && <img src={vimg} alt="Prévia" className="petshop-preview-img" />}
            </div>

            <button type="submit" disabled={isSubmitting} className="petshop-btn">
              {isSubmitting ? (
                <>
                  <div className="petshop-spinner"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Registrar Doação</span>
                </>
              )}
            </button>
          </form>
        </motion.section>

        {/* LOG DE DOAÇÕES — APENAS FUNCIONÁRIO */}
        {userRole === 'FUNCIONARIO' && (
          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="petshop-card petshop-list-card"
          >
            <div className="petshop-header">
              <div className="petshop-icon-wrapper">
                <PawPrint className="petshop-icon" />
              </div>
              <h2>Histórico de Doações</h2>
            </div>

            <ul className="petshop-list">
              <AnimatePresence>
                {doacoes.length === 0 ? (
                  <li className="petshop-empty">Nenhuma doação registrada.</li>
                ) : (
                  doacoes.map((doacao) => (
                    <motion.li
                      key={doacao.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="petshop-list-item"
                    >
                      <div className="petshop-product-info">
                        <h3>{doacao.nome} ({doacao.raca})</h3>
                        <p>Pelagem: {doacao.pelagem || 'Não informado'}</p>
                        <div className="petshop-meta">
                          <span>Idade: {doacao.idade || '?'} meses</span>
                          <span className="petshop-date">
                            {new Date(doacao.dataDoacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      {doacao.imagem && (
                        <img src={doacao.imagem} alt={doacao.nome} className="petshop-thumb" />
                      )}
                      <button
                        onClick={() => handleDeleteDoacao(doacao.id)}
                        className="petshop-delete-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.li>
                  ))
                )}
              </AnimatePresence>
            </ul>
          </motion.section>
        )}
      </div>
    </div>
      <Footer />
    </>
  );
};

export default DoarAnimal;