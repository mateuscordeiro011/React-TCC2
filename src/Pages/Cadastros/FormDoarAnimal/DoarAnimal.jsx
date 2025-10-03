import { useState } from "react";
import api from "../../../service/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import "./DoarAnimal.css";
import Footer from "../../../components/Footer/Footer";
import Navbar from "../../../components/Header/Header";

const DoarAnimal = () => {
  const [vnome, setNome] = useState("");
  const [vespecie, setEspecie] = useState("");
  const [vraca, setRaca] = useState("");
  const [vdatanasc, setDataNasc] = useState("");
  const [vsexo, setSexo] = useState("");
  const [vpeso, setPeso] = useState("");
  const [vimg, setImg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vnome || !vespecie) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const idClienteDoador = 1;

      const response = await api.post("http://localhost:8080/api-salsi/doacoes", {
        id_cliente_doador: idClienteDoador,
        nome: vnome,
        especie: vespecie,
        raca: vraca || null,
        data_nascimento: vdatanasc ? new Date(vdatanasc) : null,
        sexo: vsexo || null,
        peso: vpeso ? parseFloat(vpeso) : null,
        foto: vimg || null,
        status: "Disponível"
      });

      resetForm();
      setMessage({ type: "success", text: "Animal cadastrado para doação com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar doação", error);
      setMessage({ type: "error", text: "Erro ao cadastrar doação." });
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
    <Navbar/>
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

        {/* LISTAGEM - Mesmo arquivo */}
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
            <h2>Animais para Adoção</h2>
          </div>

          <ul className="petshop-list">
            <li className="petshop-empty">Lista integrada no mesmo componente.</li>
          </ul>
        </motion.section>
      </div>
    </div>

      <Footer/>
    </>

  );
};

export default DoarAnimal;