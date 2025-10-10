// src/Pages/Perfil/Funcionario/PerfilFuncionario.jsx
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../utils/useAuth";
import axios from "axios";
import "./PerfilFuncionario.css";
import Footer from "../../../components/Footer/Footer";

export default function PerfilFuncionario() {
  const { user, loading: authLoading, logout } = useAuth();
  const { darkMode } = useTheme();
  const [funcionario, setFuncionario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    foto: null,
    fotoPreview: null,
  });

  const fileInputRef = useRef(null);

  // Buscar CEP
  const buscarCep = async (valor) => {
    const cepLimpo = valor.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = response.data;

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            rua: data.logradouro || prev.rua,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado,
          }));
        }
      } catch (err) {
        console.warn("Erro ao buscar CEP:", err);
      }
    }
  };

  const handleCepChange = (e) => {
    const value = e.target.value;
    const cepNumeros = value.replace(/\D/g, "");
    let novoCep = "";

    if (cepNumeros.length <= 5) {
      novoCep = cepNumeros;
    } else if (cepNumeros.length <= 8) {
      novoCep = `${cepNumeros.slice(0, 5)}-${cepNumeros.slice(5)}`;
    }

    setFormData((prev) => ({ ...prev, cep: novoCep }));

    if (cepNumeros.length === 8) {
      buscarCep(cepNumeros);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result.split(",")[1];
        setFormData((prev) => ({
          ...prev,
          foto: file,
          fotoPreview: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setMensagem({ tipo: "erro", texto: "As senhas não coincidem!" });
      return;
    }

    // ✅ Payload compatível
    const payload = {
      email: user.nome, 
      nome: formData.nome,
      senha: formData.senha || null,
      cep: formData.cep.replace(/\D/g, "") || "",
      rua: formData.rua || "",
      numero: formData.numero || "",
      complemento: formData.complemento || "",
      bairro: formData.bairro || "",
      cidade: formData.cidade || "",
      estado: formData.estado || "",
    };

    try {
      // ✅ Usa a rota CORRETA para atualizar perfil de funcionário
      await axios.post(`http://localhost:8080/api-salsi/funcionarios/perfil`, payload);

      // Upload de foto (se houver)
      if (formData.foto) {
        const formDataUpload = new FormData();
        formDataUpload.append("email", user.email);
        formDataUpload.append("foto", formData.foto);
        await axios.post(`http://localhost:8080/api-salsi/funcionarios/perfil/foto`, formDataUpload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Recarrega perfil
      const res = await axios.get(`http://localhost:8080/api-salsi/funcionarios/perfil?email=${encodeURIComponent(user.email)}`);
      const data = res.data;
      setFuncionario(data);

      // Atualiza formData
      const cepFormatado = data.endereco?.cep
        ? data.endereco.cep.length === 8
          ? `${data.endereco.cep.slice(0, 5)}-${data.endereco.cep.slice(5)}`
          : data.endereco.cep
        : "";

      setFormData({
        nome: data.nome || "",
        email: data.email || "",
        senha: "",
        confirmarSenha: "",
        cep: cepFormatado,
        rua: data.endereco?.rua || "",
        numero: data.endereco?.numero || "",
        complemento: data.endereco?.complemento || "",
        bairro: data.endereco?.bairro || "",
        cidade: data.endereco?.cidade || "",
        estado: data.endereco?.estado || "",
        foto: null,
        fotoPreview: data.foto || null,
      });

      setMensagem({ tipo: "sucesso", texto: "Perfil atualizado com sucesso!" });
      setIsEditing(false);
    } catch (err) {
      console.error("Erro na atualização:", err);
      setMensagem({
        tipo: "erro",
        texto: err.response?.data?.erro || "Erro ao atualizar perfil.",
      });
    }
  };

  // Funções auxiliares de formatação
  const getBase64ImageSrc = (imageData) => {
    const fallbackSVG =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";

    if (!imageData) return fallbackSVG;
    const str = String(imageData).trim();
    if (!str) return fallbackSVG;

    if (str.startsWith("data:image/")) return str;
    if (str.startsWith("http")) return fallbackSVG;

    if (str.startsWith("iVBOR")) return `data:image/png;base64,${str}`;
    if (str.startsWith("R0lGO")) return `data:image/gif;base64,${str}`;
    if (str.startsWith("/9j/")) return `data:image/jpeg;base64,${str}`;

    try {
      atob(str);
      return `data:image/jpeg;base64,${str}`;
    } catch {
      return fallbackSVG;
    }
  };

  const formatCPF = (cpf) => (cpf ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") : "");

  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    }
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  };

  const formatAddress = (endereco) => {
    if (!endereco) return "Endereço não cadastrado";
    const { rua, numero, complemento, bairro, cidade, estado } = endereco;
    return `${rua}, ${numero}${complemento ? `, ${complemento}` : ""} - ${bairro}, ${cidade} - ${estado}`;
  };

  // Carregar perfil inicial
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      setError("");
      return;
    }

    if (!user) {
      setError("Você não está logado.");
      setLoading(false);
      return;
    }

    if (user.tipo !== "FUNCIONARIO") {
      setError("Acesso permitido apenas para funcionários.");
      setLoading(false);
      return;
    }

    const email = user.email;
    if (!email) {
      setError("E-mail não disponível. Tente fazer login novamente.");
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const encodedEmail = encodeURIComponent(email);
        const res = await axios.get(`http://localhost:8080/api-salsi/funcionarios/perfil?email=${encodedEmail}`, {
          withCredentials: true,
        });
        const data = res.data;
        setFuncionario(data);

        const cepFormatado = data.endereco?.cep
          ? data.endereco.cep.length === 8
            ? `${data.endereco.cep.slice(0, 5)}-${data.endereco.cep.slice(5)}`
            : data.endereco.cep
          : "";

        setFormData({
          nome: data.nome || "",
          email: data.email || "",
          senha: "",
          confirmarSenha: "",
          cep: cepFormatado,
          rua: data.endereco?.rua || "",
          numero: data.endereco?.numero || "",
          complemento: data.endereco?.complemento || "",
          bairro: data.endereco?.bairro || "",
          cidade: data.endereco?.cidade || "",
          estado: data.endereco?.estado || "",
          foto: null,
          fotoPreview: data.foto || null,
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading]);

  // Fechar menu de foto ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-photo-container")) {
        setIsPhotoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Renderizações condicionais
  if (loading) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="profile-container">
          <div className="loading-spinner">Carregando seu perfil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="profile-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!funcionario) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="profile-container">
          <div className="no-data-message">Nenhum dado encontrado.</div>
        </div>
        <Footer />
      </div>
    );
  }

  // === JSX Principal ===
  return (
    <>
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        {/* Mensagem de feedback (popup) */}
        {mensagem && (
          <div className={`popup ${mensagem.tipo}`}>
            <p>{mensagem.texto}</p>
            <button onClick={() => setMensagem(null)}>Fechar</button>
          </div>
        )}

        <div className="profile-container">
          <header className="profile-header">
            <h1>Meu Perfil</h1>
            <button className="logout-btn" onClick={logout} title="Sair da conta">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </header>

          {/* Foto de perfil */}
          <div className="profile-photo-container-wrapper">
            <div
              className="profile-photo-container"
              onAuxClick={() => setIsPhotoMenuOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={getBase64ImageSrc(funcionario.foto)}
                alt="Foto de perfil"
                className="profile-photo"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                }}
              />
              <div className={`photo-menu ${isPhotoMenuOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className="menu-btn remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Tem certeza que deseja remover sua foto de perfil?")) {
                      setFormData((prev) => ({ ...prev, foto: null, fotoPreview: null }));
                      setIsPhotoMenuOpen(false);
                    }
                  }}
                >
                  REMOVER IMAGEM
                </button>
                <button
                  type="button"
                  className="menu-btn change-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                    setIsPhotoMenuOpen(false);
                  }}
                >
                  TROCAR IMAGEM
                </button>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <div className="user-type-badge">
            <i className="fas fa-user-tie"></i> Funcionário
          </div>

          <div className="profile-info-card">
            <div className="info-item">
              <i className="fas fa-user"></i>
              <strong>Nome:</strong> {funcionario.nome}
            </div>
            <div className="info-item">
              <i className="fas fa-envelope"></i>
              <strong>Email:</strong> {funcionario.email}
            </div>
            <div className="info-item">
              <i className="fas fa-id-card"></i>
              <strong>CPF:</strong> {formatCPF(funcionario.cpf)}
            </div>
    
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <strong>Endereço:</strong> {formatAddress(funcionario.endereco)}
            </div>
          </div>

          <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
            <i className="fas fa-edit"></i> Editar Perfil
          </button>
        </div>
      </div>

      {/* Modal de Edição */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsEditing(false)}>
              ×
            </button>
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit} className="edit-form">
              {/* Foto */}
              <div className="form-group">
                <label>Foto de Perfil</label>
                <div className="photo-upload">
                  <img
                    src={
                      formData.fotoPreview
                        ? `data:image/jpeg;base64,${formData.fotoPreview}`
                        : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+"
                    }
                    alt="Preview"
                    className="photo-preview"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Escolher Imagem
                  </button>
                </div>
              </div>

              {/* Nome */}
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

             

              {/* Senha */}
              <div className="form-group">
                <label>Nova Senha (opcional)</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                />
              </div>

              {/* Endereço */}
              <h3>Endereço</h3>
              <input
                type="text"
                placeholder="CEP (00000-000)"
                value={formData.cep}
                onChange={handleCepChange}
                maxLength="9"
                className="endereco-input"
              />
              <input
                type="text"
                placeholder="Logradouro (rua, avenida...)"
                value={formData.rua}
                onChange={(e) => setFormData((prev) => ({ ...prev, rua: e.target.value }))}
                className="endereco-input"
              />
              <input
                type="text"
                placeholder="Número"
                value={formData.numero}
                onChange={(e) => setFormData((prev) => ({ ...prev, numero: e.target.value }))}
                className="endereco-input"
              />
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={formData.complemento}
                onChange={(e) => setFormData((prev) => ({ ...prev, complemento: e.target.value }))}
                className="endereco-input"
              />
              <input
                type="text"
                placeholder="Bairro"
                value={formData.bairro}
                onChange={(e) => setFormData((prev) => ({ ...prev, bairro: e.target.value }))}
                className="endereco-input"
              />
              <input
                type="text"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={(e) => setFormData((prev) => ({ ...prev, cidade: e.target.value }))}
                className="endereco-input"
              />
              <input
                type="text"
                placeholder="Estado (SP, RJ...)"
                value={formData.estado}
                onChange={(e) => setFormData((prev) => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                maxLength="2"
                className="endereco-input"
              />

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
                <button type="submit" className="save-btn">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}