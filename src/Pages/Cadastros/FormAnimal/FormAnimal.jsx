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
import "./FormAnimal.css";
import Navbar from "../../../components/Header/NavbarFuncionario";
import Footer from "../../../components/Footer/Footer";

const FormAnimal = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [vnome, setNome] = useState("");
  const [vespecie, setEspecie] = useState("");
  const [vpeso, setPeso] = useState("");
  const [vraca, setRaca] = useState("");
  const [vimg, setImg] = useState(""); // Sempre será uma URL data: válida ou string vazia
  const [vsexo, setSexo] = useState("");
  const [vnascimento, setNascimento] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [animalEditando, setAnimalEditando] = useState(null);

  const backgroundImageStyle = {
    backgroundImage: `url('../../src/IMG/wallpaper/jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textAlign: 'center'
  };

  useEffect(() => {
    const fetchAnimais = async () => {
      try {
        const res = await api.get("http://localhost:8080/api-salsi/animais");
        setUsuarios(res.data);
      } catch (err) {
        console.error("Erro ao buscar animais", err);
        setMessage({ type: "error", text: "Falha ao carregar animais." });
      }
    };
    fetchAnimais();
  }, []);

  const resetForm = () => {
    setNome("");
    setEspecie("");
    setRaca("");
    setPeso("");
    setSexo("");
    setNascimento("");
    setImg("");
    setAnimalEditando(null);
  };

  const handleEdit = (animal) => {
    setNome(animal.nome);
    setEspecie(animal.especie || "");
    setRaca(animal.raca || "");
    setSexo(animal.sexo);
    setPeso(animal.peso);
    setNascimento(animal.nascimento);
    setAnimalEditando(animal.id_animal);

    if (animal.foto) {
      setImg(`data:image/jpeg;base64,${animal.foto}`);
    } else {
      setImg("");
    }
  };

  const calculateAge = (nascimento) => {
    if (!nascimento) return "Desconhecida";

    const dob = new Date(nascimento);
    if (isNaN(dob.getTime())) return "Desconhecida";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vnome || !vraca || !vsexo || !vpeso || !vnascimento) {
      setMessage({ type: "error", text: "Preencha todos os campos obrigatórios." });
      return;
    }

    const pesoFloat = parseFloat(vpeso);
    if (isNaN(pesoFloat) || pesoFloat <= 0) {
      setMessage({ type: "error", text: "Peso inválido. Informe um valor maior que zero." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        nome: vnome,
        especie: vespecie,
        raca: vraca,
        sexo: vsexo,
        peso: pesoFloat,
        nascimento: vnascimento
      };

      if (vimg && vimg.startsWith("data:image")) {
        const base64Part = vimg.split(",")[1];
        if (base64Part) {
          payload.foto = base64Part;
        }
      }

      let response;
      if (animalEditando) {
        response = await api.put(
          `http://localhost:8080/api-salsi/animais/${animalEditando}`,
          payload
        );
        setUsuarios((prev) =>
          prev.map((p) => (p.id_animal === animalEditando ? response.data : p))
        );
        setMessage({ type: "success", text: "Animal atualizado com sucesso!" });
      } else {
        response = await api.post("http://localhost:8080/api-salsi/animais", payload);
        setUsuarios((prev) => [...prev, response.data]);
        setMessage({ type: "success", text: "Animal cadastrado com sucesso!" });
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar animal", error.response?.data || error.message);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Erro ao salvar animal.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (animal) => {
    setAnimalToDelete(animal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const animal = animalToDelete;
    setShowDeleteModal(false);

    try {
      await api.delete(`http://localhost:8080/api-salsi/animais/${animal.id_animal}`);
      setUsuarios((prev) => prev.filter((p) => p.id_animal !== animal.id_animal));
      setSuccessMessage(`O animal "${animal.nome}" foi excluído com sucesso!`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao deletar animal", error);
      setMessage({ type: "error", text: "Erro ao excluir animal." });
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setAnimalToDelete(null);
  };

  const getValidImageUrl = (imgValue) => {
    if (!imgValue) return "";
    if (imgValue.startsWith("image")) return imgValue;
    return `image/jpeg;base64,${imgValue}`;
  };

  return (
    <>
      <Navbar />

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
              <h2>{animalEditando ? "Editar Animal" : "Cadastrar Animal"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="petshop-form">
              <div className="petshop-input-group">
                <label>Nome do Animal *</label>
                <input
                  type="text"
                  value={vnome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Thor"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Espécie</label>
                <input
                  type="text"
                  value={vespecie}
                  onChange={(e) => setEspecie(e.target.value)}
                  placeholder="Ex: Cachorro, Gato"
                />
              </div>

              <div className="petshop-input-group">
                <label>Raça *</label>
                <input
                  type="text"
                  value={vraca}
                  onChange={(e) => setRaca(e.target.value)}
                  placeholder="Ex: Pastor Alemão"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Sexo *</label>
                <input
                  type="text"
                  value={vsexo}
                  onChange={(e) => setSexo(e.target.value)}
                  placeholder="Macho / Fêmea"
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Peso (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5.5"
                  value={vpeso}
                  onChange={(e) => setPeso(e.target.value)}
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  value={vnascimento}
                  onChange={(e) => setNascimento(e.target.value)}
                  required
                />
              </div>

              <div className="petshop-input-group">
                <label>Imagem do Animal</label>
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
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImg(reader.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setImg("");
                    }
                  }}
                  style={{ display: "none" }}
                />
                {vimg && (
                  <img
                    src={vimg}
                    alt="Prévia"
                    className="petshop-preview-img"
                    onError={() => setImg("")}
                  />
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="petshop-btn">
                {isSubmitting ? (
                  <>
                    <div className="petshop-spinner"></div>
                    <span>{animalEditando ? "Atualizando..." : "Cadastrando..."}</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>{animalEditando ? "Atualizar Animal" : "Cadastrar Animal"}</span>
                  </>
                )}
              </button>

              {animalEditando && (
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

          {/* Lista de Animais */}
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
              <h2>Animais Cadastrados</h2>
            </div>

            <ul className="petshop-list">
              <AnimatePresence>
                {usuarios.length === 0 ? (
                  <li className="petshop-empty">Nenhum animal cadastrado.</li>
                ) : (
                  usuarios.map((animal) => {
                    const idade = calculateAge(animal.nascimento);
                    return (
                      <motion.li
                        key={animal.id_animal}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="petshop-list-item"
                      >
                        <div className="petshop-product-info">
                          <h3>{animal.nome}</h3>
                          <p>{animal.raca}</p>
                          <div className="petshop-meta">
                            <strong className="petshop-price">
                              {animal.peso?.toFixed(2)} Kg
                            </strong>
                            <span className="petshop-stock">
                              Idade: {idade}{" "}
                              {typeof idade === "number"
                                ? idade === 1
                                  ? "ano"
                                  : "anos"
                                : ""}
                            </span>
                          </div>
                        </div>
                        {animal.foto && (
                          <img
                            src={`data:image/jpeg;base64,${animal.foto}`}
                            alt={animal.nome}
                            className="catalog-item-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="petshop-actions">
                          <button
                            onClick={() => handleEdit(animal)}
                            className="petshop-edit-btn"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(animal)}
                            className="petshop-delete-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.li>
                    );
                  })
                )}
              </AnimatePresence>
            </ul>
          </motion.section>
        </div>

        {/* Modal de exclusão */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                className="modal"
                initial={{ scale: 0.9, y: -30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -30 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Excluir animal?</h3>
                <p>
                  Você tem certeza que deseja excluir{" "}
                  <strong>{animalToDelete?.nome}</strong>?<br />
                  Esta ação não pode ser desfeita.
                </p>
                <div className="modal-buttons">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="modal-btn modal-btn-cancel"
                  >
                    Cancelar
                  </button>
                  <button onClick={confirmDelete} className="modal-btn modal-btn-delete">
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de sucesso */}
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

export default FormAnimal;