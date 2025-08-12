import { useState, useEffect } from "react";
import api from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import "./FormProduto.css";

const FormProduto = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [vnome, setNome] = useState("");
  const [vdesc, setDesc] = useState("");
  const [vpreco, setPreco] = useState("");
  const [vimg, setImg] = useState("");
  const [vestoque, setEstoque] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);


  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await api.get("http://localhost:8080/api-salsi/produtos");
        setUsuarios(res.data);
      } catch (err) {
        console.error("Erro ao buscar produtos", err);
        setMessage({ type: "error", text: "Falha ao carregar produtos." });
      }
    };
    fetchProdutos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vnome || !vpreco || !vestoque) {
      setMessage({ type: "error", text: "Preencha os campos obrigatórios." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post("http://localhost:8080/api-salsi/produtos", {
        nome: vnome,
        descricao: vdesc,
        precovenda: parseFloat(vpreco),
        estoque: parseInt(vestoque),
        imagem: vimg,
      });

      setUsuarios((prev) => [...prev, response.data]);
      resetForm();
      setMessage({ type: "success", text: "Produto cadastrado com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar produto", error);
      setMessage({ type: "error", text: "Erro ao cadastrar produto." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await api.delete(`http://localhost:8080/api-salsi/produtos/${id}`);
      setUsuarios((prev) => prev.filter((p) => p.id !== id));
      setMessage({ type: "success", text: "Produto excluído com sucesso!" });
    } catch (error) {
      console.log("Erro ao deletar produto", error);
      setMessage({ type: "error", text: "Erro ao excluir produto." });
    }
  };

  const resetForm = () => {
    setNome("");
    setDesc("");
    setPreco("");
    setEstoque("");
    setImg("");
  };

  return (
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
            <h2>Cadastrar Produto</h2>
          </div>

          <form onSubmit={handleSubmit} className="petshop-form">
            <div className="petshop-input-group">
              <label>Nome do Produto *</label>
              <input
                type="text"
                value={vnome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Ração Premium para Cães"
                required
              />
            </div>

            <div className="petshop-input-group">
              <label>Descrição</label>
              <input
                type="text"
                value={vdesc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Ração balanceada com vitaminas"
              />
            </div>

            <div className="petshop-input-group">
              <label>Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={vpreco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="petshop-input-group">
              <label>Estoque *</label>
              <input
                type="number"
                value={vestoque}
                onChange={(e) => setEstoque(e.target.value)}
                placeholder="Quantidade disponível"
                required
              />
            </div>

            <div className="petshop-input-group">
              <label>Imagem do Produto</label>
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
                  <span>Cadastrar Produto</span>
                </>
              )}
            </button>
          </form>
        </motion.section>

        {/* LISTAGEM */}
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
            <h2>Produtos Cadastrados</h2>
          </div>

          <ul className="petshop-list">
            <AnimatePresence>
              {usuarios.length === 0 ? (
                <li className="petshop-empty">Nenhum produto cadastrado.</li>
              ) : (
                usuarios.map((produto) => (
                  <motion.li
                    key={produto.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="petshop-list-item"
                  >
                    <div className="petshop-product-info">
                      <h3>{produto.nome}</h3>
                      <p>{produto.descricao}</p>
                      <div className="petshop-meta">
                        <strong className="petshop-price">R$ {parseFloat(produto.precovenda).toFixed(2)}</strong>
                        <span className="petshop-stock">Estoque: {produto.estoque}</span>
                      </div>
                    </div>
                    {produto.imagem && (
                      <img src={produto.imagem} alt={produto.nome} className="petshop-thumb" />
                    )}
                    <button
                      onClick={() => handleDelete(produto.id)}
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

      </div>
    </div>
  );
};

export default FormProduto;