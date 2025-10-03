import { useState, useEffect } from "react";
import api from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit2,
  ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./FormProduto.css";
import Navbar from "../../../components/Header/NavbarFuncionario";
import Footer from "../../../components/Footer/Footer";

const FormProduto = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [vnome, setNome] = useState("");
  const [vdesc, setDesc] = useState("");
  const [vpreco, setPreco] = useState("");
  const [vimg, setImg] = useState("");
  const [vestoque, setEstoque] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    console.log("--- useEffect: Iniciando carregamento da lista de produtos ---");
    const fetchProdutos = async () => {
      try {
        const res = await api.get("http://localhost:8080/api-salsi/produtos");
        console.log("Produtos carregados com sucesso:", res.data);
        setUsuarios(res.data);
        if (res.data.length === 0) {
          console.log("Nenhum produto encontrado no backend.");
        }
      } catch (err) {
        console.error("❌ Erro ao buscar produtos:", err);
        setMessage({ type: "error", text: "Falha ao carregar produtos." });
      }
    };
    fetchProdutos();
  }, []); // Executa apenas uma vez, na montagem do componente

  // --- Adicionando console.log para monitorar mudanças no estado `usuarios` ---
  useEffect(() => {
    console.log("🔄 Estado 'usuarios' atualizado. Total de produtos:", usuarios.length);
  }, [usuarios]);

  // --- Adicionando console.log para monitorar mudanças no estado `produtoEditando` ---
  useEffect(() => {
    if (produtoEditando !== null) {
      console.log("✏️ Modo de edição ativado para o produto ID:", produtoEditando);
    } else {
      console.log("🆕 Modo de criação ativado.");
    }
  }, [produtoEditando]);

  // Limpar formulário
  const resetForm = () => {
    console.log("--- resetForm: Limpando o formulário ---");
    setNome("");
    setDesc("");
    setPreco("");
    setEstoque("");
    setImg("");
    setProdutoEditando(null);
    console.log("✅ Formulário limpo.");
  };

  const handleEdit = (produto) => {
    console.log("--- handleEdit: Iniciando edição do produto ---", produto);
    setProdutoEditando(produto.id_produto);
    setNome(produto.nome);
    setDesc(produto.descricao || "");
    setPreco(produto.preco);
    setEstoque(produto.estoque);

    if (produto.foto && produto.foto.startsWith("data:image")) {
      setImg(produto.foto);
      console.log("🖼️ Imagem do produto carregada para edição.");
    } else {
      setImg("");
      console.log("⚠️ Produto não possui imagem ou formato inválido.");
    }
    console.log("✅ Dados do produto carregados para edição.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("--- handleSubmit: Iniciando envio do formulário ---");
    if (!vnome || !vpreco || !vestoque || !vdesc) {
      console.warn("⚠️ Campos obrigatórios não preenchidos.");
      setMessage({ type: "error", text: "Preencha os campos obrigatórios." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    console.log("📤 Enviando dados do produto:", {
      nome: vnome,
      descricao: vdesc,
      preco: parseFloat(vpreco),
      estoque: parseInt(vestoque),
      foto: vimg ? "Imagem presente (base64)" : "Sem imagem",
    });

    try {
      const payload = {
        nome: vnome,
        descricao: vdesc,
        preco: parseFloat(vpreco),
        estoque: parseInt(vestoque),
      };

      if (vimg && vimg.startsWith("data:image")) {
        payload.foto = vimg;
      }

      let response;
      if (produtoEditando) {
        console.log(`🔄 Atualizando produto existente (ID: ${produtoEditando})...`);
        response = await api.put(
          `http://localhost:8080/api-salsi/produtos/${produtoEditando}`,
          payload
        );
        console.log("✅ Produto atualizado com sucesso!", response.data);
        setUsuarios((prev) =>
          prev.map((p) =>
            p.id_produto === produtoEditando ? response.data : p
          )
        );
        setMessage({
          type: "success",
          text: "Produto atualizado com sucesso!",
        });
      } else {
        console.log("➕ Cadastrando novo produto...");
        response = await api.post(
          "http://localhost:8080/api-salsi/produtos",
          payload
        );
        console.log("✅ Produto cadastrado com sucesso!", response.data);
        setUsuarios((prev) => [...prev, response.data]);
        setMessage({
          type: "success",
          text: "Produto cadastrado com sucesso!",
        });
      }

      resetForm();
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error.response?.data || error.message);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao salvar produto.",
      });
    } finally {
      setIsSubmitting(false);
      console.log("--- handleSubmit: Finalizado ---");
    }
  };

  // Iniciar exclusão
  const handleDelete = (produto) => {
    console.log("--- handleDelete: Solicitando exclusão do produto ---", produto);
    setProductToDelete(produto);
    setShowDeleteModal(true);
    console.log("🔍 Modal de confirmação de exclusão aberto.");
  };

  // Confirmar exclusão
  const confirmDelete = async () => {
    const produto = productToDelete;
    console.log(`🗑️ Confirmando exclusão do produto ID: ${produto.id_produto} - Nome: ${produto.nome}`);
    setShowDeleteModal(false);

    try {
      await api.delete(`http://localhost:8080/api-salsi/produtos/${produto.id_produto}`);
      console.log("✅ Produto excluído com sucesso do backend.");
      setUsuarios((prev) => prev.filter((p) => p.id_produto !== produto.id_produto));
      setSuccessMessage(`O produto "${produto.nome}" foi excluído com sucesso!`);
      setShowSuccessModal(true);
      console.log("🔍 Modal de sucesso aberto.");
    } catch (error) {
      console.error("❌ Erro ao deletar produto:", error);
      setMessage({ type: "error", text: "Erro ao excluir produto." });
    }
  };

  // Fechar modal de sucesso
  const closeSuccessModal = () => {
    console.log("--- closeSuccessModal: Fechando modal de sucesso ---");
    setShowSuccessModal(false);
    setProductToDelete(null);
    console.log("✅ Modal de sucesso fechado.");
  };

  // --- Adicionando console.log para mudança de campos do formulário ---
  const handleChangeNome = (e) => {
    const value = e.target.value;
    setNome(value);
    console.log("📝 Nome do produto alterado:", value);
  };

  const handleChangeDesc = (e) => {
    const value = e.target.value;
    setDesc(value);
    console.log("📝 Descrição do produto alterada:", value);
  };

  const handleChangePreco = (e) => {
    const value = e.target.value;
    setPreco(value);
    console.log("💰 Preço do produto alterado:", value);
  };

  const handleChangeEstoque = (e) => {
    const value = e.target.value;
    setEstoque(value);
    console.log("📦 Estoque do produto alterado:", value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("--- handleFileChange: Arquivo selecionado ---", file?.name);
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => {
        console.log("🔄 Iniciando leitura do arquivo...");
      };
      reader.onloadend = () => {
        setImg(reader.result);
        console.log("✅ Arquivo lido e convertido para base64.");
      };
      reader.onerror = (err) => {
        console.error("❌ Erro ao ler o arquivo:", err);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("ℹ️ Nenhum arquivo selecionado ou seleção cancelada.");
    }
  };


  return (
    <>
      <Navbar />

      {/* Alert animado (topo) */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`petshop-alert petshop-alert-${message.type}`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="petshop-container">
        <div className="petshop-grid">
          {/* Formulário */}
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
              <h2>{produtoEditando ? "Editar Produto" : "Cadastrar Produto"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="petshop-form">
              <div className="petshop-input-group">
                <label>Nome do Produto *</label>
                <input
                  type="text"
                  value={vnome}
                  onChange={handleChangeNome} // Usando o handler com log
                  placeholder="Ex: Ração Premium para Cães"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={vdesc}
                  onChange={handleChangeDesc} // Usando o handler com log
                  placeholder="Ex: Ração balanceada com vitaminas"
                />
              </div>

              <div className="petshop-input-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={vpreco}
                  onChange={handleChangePreco} // Usando o handler com log
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Estoque *</label>
                <input
                  type="number"
                  value={vestoque}
                  onChange={handleChangeEstoque} // Usando o handler com log
                  placeholder="Quantidade disponível"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Imagem do Produto</label>
                <div
                  className="petshop-file-upload"
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <ImageIcon size={20} />
                  <span>{vimg ? "Imagem carregada" : "Clique para selecionar imagem"}</span>
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange} // Usando o handler com log
                  style={{ display: "none" }}
                />
                {vimg && <img src={vimg} alt="Prévia" className="petshop-preview-img" />}
              </div>

              <button type="submit" disabled={isSubmitting} className="petshop-btn">
                {isSubmitting ? (
                  <>
                    <div className="petshop-spinner"></div>
                    <span>{produtoEditando ? "Atualizando..." : "Cadastrando..."}</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>{produtoEditando ? "Atualizar Produto" : "Cadastrar Produto"}</span>
                  </>
                )}
              </button>

              {produtoEditando && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="petshop-btn petshop-btn-secondary"
                >
                  Cancelar Edição
                </button>
              )}
            </form>
          </motion.section>

          {/* Lista de Produtos */}
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
                      key={produto.id_produto}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="petshop-list-item"
                    >
                      <div className="petshop-product-info">
                        <h3>{produto.nome}</h3>
                        <p>{produto.descricao}</p>
                        <div className="petshop-meta">
                          <strong className="petshop-price">
                            R$ {produto.preco?.toFixed(2)}
                          </strong>
                          <span className="petshop-stock">Estoque: {produto.estoque}</span>
                        </div>
                      </div>
                      {produto.foto && (
                        <img
                          src={produto.foto}
                          alt={produto.nome}
                          className="catalog-item-image"
                        />
                      )}
                      <div className="petshop-actions">
                        <button
                          onClick={() => handleEdit(produto)}
                          className="petshop-edit-btn"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(produto)}
                          className="petshop-delete-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.li>
                  ))
                )}
              </AnimatePresence>
            </ul>
          </motion.section>
        </div>

        {/* ============================== */}
        {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
        {/* ============================== */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                console.log("--- Modal de exclusão: Fechado ao clicar fora ---");
                setShowDeleteModal(false);
              }}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.9, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Excluir Produto?</h3>
                <p>
                  Você tem certeza que deseja excluir{" "}
                  <strong>{productToDelete?.nome}</strong>?<br />
                  Esta ação não pode ser desfeita.
                </p>
                <div className="modal-buttons">
                  <button
                    onClick={() => {
                      console.log("--- Modal de exclusão: Cancelado ---");
                      setShowDeleteModal(false);
                    }}
                    className="modal-btn modal-btn-cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="modal-btn modal-btn-delete"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================== */}
        {/* MODAL DE SUCESSO */}
        {/* ============================== */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSuccessModal}
            >
              <motion.div
                className="modal modal-success"
                initial={{ scale: 0.9, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -30 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <CheckCircle size={48} color="#4CAF50" />
                <h3>Sucesso!</h3>
                <p>{successMessage}</p>
                <button onClick={closeSuccessModal} className="modal-btn">
                  Fechar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
};

export default FormProduto;