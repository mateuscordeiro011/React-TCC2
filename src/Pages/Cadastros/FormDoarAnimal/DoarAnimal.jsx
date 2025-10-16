import { useState } from "react";
import api from "../../../service/api";
import { useAuth } from "../../../utils/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import LoginRequiredModal from "../../../components/LoginRequiredModal/LoginRequiredModal";
import "./DoarAnimal.css";
import Footer from "../../../components/Footer/Footer";
import Navbar from "../../../components/Header/Header";

const DoarAnimal = () => {
  const { user } = useAuth();
  const [vnome, setNome] = useState("");
  const [vespecie, setEspecie] = useState("");
  const [vraca, setRaca] = useState("");
  const [vdatanasc, setDataNasc] = useState("");
  const [vsexo, setSexo] = useState(""); // Agora só aceita "M" ou "F"
  const [vpeso, setPeso] = useState("");
  const [vimg, setImg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!vnome.trim() || !vespecie.trim()) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios (Nome e Espécie)." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Processa a imagem: extrai apenas o base64 sem o prefixo
      let fotoBase64 = null;
      if (vimg) {
        // Remove o prefixo "data:image/...;base64,"
        fotoBase64 = vimg.split(',')[1] || null;
      }

      const payload = {
        id_cliente_doador: user.id,
        nome: vnome.trim(),
        especie: vespecie.trim(),
        raca: vraca.trim() || null,
        data_nascimento: vdatanasc || null, // input type="date" já retorna YYYY-MM-DD
        sexo: vsexo || null, // ← agora só envia "M", "F" ou null
        peso: vpeso ? parseFloat(vpeso) : null,
        foto: fotoBase64 // ← base64 puro ou null
      };

      await api.post("/api-salsi/doacoes", payload);

      resetForm();
      setMessage({ type: "success", text: "Animal cadastrado para doação com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar doação", error);
      if (error.response?.status === 400) {
        setMessage({ type: "error", text: "Dados inválidos. Verifique os campos e tente novamente." });
      } else if (error.response?.status === 500) {
        setMessage({ type: "error", text: "Erro interno. Tente novamente mais tarde." });
      } else {
        setMessage({ type: "error", text: "Erro ao cadastrar doação. Verifique sua conexão." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNome("");
    setEspecie("");
    setRaca("");
    setDataNasc("");
    setSexo("");
    setPeso("");
    setImg("");
  };

  return (
    <>
      <Navbar />
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
          <motion.section
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="petshop-card petshop-form-card"
          >
            <div className="petshop-header">
              <div className="petshop-icon-wrapper">
                <Plus className="petshop-icon" />
              </div>
              <h2>Cadastrar Animal para Doação</h2>
            </div>

            <form onSubmit={handleSubmit} className="petshop-form">
              <div className="petshop-input-group">
                <label>Nome do Animal *</label>
                <input
                  type="text"
                  value={vnome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Rex"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Espécie *</label>
                <input
                  type="text"
                  value={vespecie}
                  onChange={(e) => setEspecie(e.target.value)}
                  placeholder="Ex: Cachorro, Gato"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Raça</label>
                <input
                  type="text"
                  value={vraca}
                  onChange={(e) => setRaca(e.target.value)}
                  placeholder="Ex: Labrador"
                />
              </div>

              <div className="petshop-input-group">
                <label>Data de Nascimento</label>
                <input
                  type="date"
                  value={vdatanasc}
                  onChange={(e) => setDataNasc(e.target.value)}
                />
              </div>

              <div className="petshop-input-group">
                <label>Sexo</label>
                {/* ✅ Corrigido: valores compatíveis com chk_sexo ('M' e 'F') */}
                <select value={vsexo} onChange={(e) => setSexo(e.target.value)}>
                  <option value="">Selecione</option>
                  <option value="M">Macho</option>
                  <option value="F">Fêmea</option>
                </select>
              </div>

              <div className="petshop-input-group">
                <label>Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vpeso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ex: 15.5"
                />
              </div>

              <div className="petshop-input-group">
                <label>Foto do Animal</label>
                <div className="petshop-file-upload" onClick={() => document.getElementById('file-input').click()}>
                  <ImageIcon size={20} />
                  <span>{vimg ? "Imagem carregada" : "Clique para selecionar imagem"}</span>
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
                    } else {
                      setImg("");
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
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Cadastrar para Doação</span>
                  </>
                )}
              </button>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="petshop-card petshop-list-card"
          >
            <div className="petshop-header">
              <div className="petshop-icon-wrapper">
                <ImageIcon className="petshop-icon" />
              </div>
              <h2>Ver Animais Disponíveis</h2>
            </div>

            <div className="petshop-catalog-link">
              <p>Quer ver todos os animais disponíveis para adoção?</p>
              <a href="/catalogo-adocao" className="petshop-btn petshop-btn-secondary">
                <ImageIcon size={18} />
                <span>Ir para Catálogo de Adoção</span>
              </a>
            </div>
          </motion.section>
        </div>
      </div>

      <Footer />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default DoarAnimal;