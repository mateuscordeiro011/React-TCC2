import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../utils/useAuth";
import "./PerfilCliente.css";
import Navbar from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";

export default function PerfilCliente() {
  const { user, loading: authLoading, logout } = useAuth();
  const { darkMode } = useTheme();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    nome: "",
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
    fotoPreview: null
  });
  const fileInputRef = useRef(null);



  // Função para buscar CEP
  const buscarCep = async (valor) => {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setEditData(prev => ({
            ...prev,
            rua: data.logradouro || prev.rua,
            bairro: data.bairro || prev.bairro,
            cidade: data.localidade || prev.cidade,
            estado: data.uf || prev.estado
          }));
        }
      } catch (err) {
        console.warn('Erro ao buscar CEP:', err);
      }
    }
  };

  // Handler para CEP
  const handleCepChange = (e) => {
    const value = e.target.value;
    const cepNumeros = value.replace(/\D/g, '');
    let novoCep = '';

    if (cepNumeros.length <= 5) {
      novoCep = cepNumeros;
    } else if (cepNumeros.length <= 8) {
      novoCep = `${cepNumeros.slice(0, 5)}-${cepNumeros.slice(5)}`;
    }

    setEditData(prev => ({ ...prev, cep: novoCep }));

    if (cepNumeros.length === 8) {
      buscarCep(cepNumeros);
    }
  };

  // Handler para arquivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result.split(',')[1];
        console.log("Base64 gerado:", base64String.substring(0, 50) + "..."); // 👈 Debug
        setEditData(prev => ({
          ...prev,
          foto: file,
          fotoPreview: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  // Handler para inputs gerais
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // Handler de submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editData.senha && editData.senha !== editData.confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    // ✅ 1. Atualiza perfil SEM foto
    const payload = {
      email: user.nome,
      nome: editData.nome || "",
      telefone: editData.telefone || "",
      senha: editData.senha || null,
      cep: editData.cep.replace(/\D/g, '') || "",
      rua: editData.rua || "",
      numero: editData.numero || "",
      complemento: editData.complemento || "",
      bairro: editData.bairro || "",
      cidade: editData.cidade || "",
      estado: editData.estado || ""
    };

    try {
      // Atualiza dados do perfil
      const response = await fetch(`http://localhost:8080/api-salsi/clientes/perfil`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || "Erro ao atualizar perfil");
      }

      // ✅ 2. Se houver nova foto, faz upload separado
      if (editData.foto) {
        const formData = new FormData();
        formData.append("email", user.nome);
        formData.append("foto", editData.foto);

        const fotoResponse = await fetch(`http://localhost:8080/api-salsi/clientes/perfil/foto`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!fotoResponse.ok) {
          const error = await fotoResponse.json();
          alert(`Foto não atualizada: ${error.erro || "Tente novamente"}`);
        }

        // ✅ Limpa o preview após enviar
        setEditData(prev => ({ ...prev, foto: null, fotoPreview: null }));
      }

      // ✅ 3. Recarrega dados atualizados
      alert("Perfil atualizado com sucesso!");
      setIsEditing(false);

      const email = user.nome;
      const encodedEmail = encodeURIComponent(email);
      const res = await fetch(`http://localhost:8080/api-salsi/clientes/perfil?email=${encodedEmail}`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      setClientData(data);

      const cepFormatado = data.endereco?.cep ?
        (data.endereco.cep.length === 8
          ? `${data.endereco.cep.slice(0, 5)}-${data.endereco.cep.slice(5)}`
          : data.endereco.cep)
        : "";

      setEditData({
        nome: data.nome || "",
        senha: "",
        confirmarSenha: "",
        cep: cepFormatado,
        rua: data.endereco?.rua || "",
        numero: data.endereco?.numero || "",
        complemento: data.endereco?.complemento || "",
        bairro: data.endereco?.bairro || "",
        cidade: data.endereco?.cidade || "",
        estado: data.endereco?.estado || "",
        telefone: data.telefone || "",
        foto: null,
        fotoPreview: data.foto ? data.foto : null // Já vem como Base64 puro do backend
      });

    } catch (err) {
      console.error("Erro na atualização:", err);
      alert("Erro: " + err.message);
    }
  };

  const getBase64ImageSrc = (imageData) => {
    const fallbackSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";

    if (!imageData) return fallbackSVG;

    const imageDataStr = String(imageData).trim();

    if (imageDataStr === "") return fallbackSVG;

    if (imageDataStr.startsWith('data:image/')) {
      return imageDataStr;
    }

    if (imageDataStr.startsWith('http://') || imageDataStr.startsWith('https://')) {
      return fallbackSVG;
    }

    if (imageDataStr.startsWith("iVBOR")) {
      return `data:image/png;base64,${imageDataStr}`;
    }
    if (imageDataStr.startsWith("R0lGO")) {
      return `data:image/gif;base64,${imageDataStr}`;
    }
    if (imageDataStr.startsWith("/9j/")) {
      return `data:image/jpeg;base64,${imageDataStr}`;
    }

    try {
      atob(imageDataStr); // Valida se é Base64 válido
      return `data:image/jpeg;base64,${imageDataStr}`;
    } catch (e) {
      console.error("getBase64ImageSrc: Base64 inválido", e.message);
      return fallbackSVG;
    }
  };

  const formatCPF = (cpf) => {
    if (!cpf) return "";
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  };

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
    const complementoStr = complemento ? `, ${complemento}` : "";
    return `${rua}, ${numero}${complementoStr} - ${bairro}, ${cidade} - ${estado}`;
  };

  useEffect(() => {
    // Se ainda está carregando a sessão → aguarde
    if (authLoading) {
      setLoading(true);
      return;
    }

    // Se não está carregando, mas não há usuário → erro
    if (!user || user.tipo !== "CLIENTE") {
      setError("Acesso permitido apenas para clientes.");
      setLoading(false);
      return;
    }

    const email = user.nome;
    if (!email) {
      setError("E-mail do usuário não encontrado.");
      setLoading(false);
      return;
    }

    const encodedEmail = encodeURIComponent(email);
    fetch(`http://localhost:8080/api-salsi/clientes/perfil?email=${encodedEmail}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setClientData(data);

        // Formatar CEP para exibição
        const cepFormatado = data.endereco?.cep ?
          (data.endereco.cep.length === 8
            ? `${data.endereco.cep.slice(0, 5)}-${data.endereco.cep.slice(5)}`
            : data.endereco.cep)
          : "";

        setEditData({
          nome: data.nome || "",
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
          fotoPreview: data.foto ? `image/jpeg;base64,${data.foto}` : null
        });
      })
      .catch((err) => {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar seu perfil.");
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-photo-container')) {
        setIsPhotoMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar />
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
        <Navbar />
        <div className="profile-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar />
        <div className="profile-container">
          <div className="no-data-message">Nenhum dado encontrado.</div>
        </div>
        <Footer />
      </div>
    );
  }

  const { nome, email, cpf, foto, endereco } = clientData;

  return (
    <>
      <Navbar />
      <div className={`profile-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="profile-container">
          {/* Header */}
          <header className="profile-header">
            <h1>Meu Perfil</h1>
            <button
              className="logout-btn"
              onClick={logout}
              title="Sair da conta"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </header>

          {/* Foto do perfil */}
          <div className="profile-photo-container-wrapper">
            <div
              className="profile-photo-container"
              onAuxClick={() => setIsPhotoMenuOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={getBase64ImageSrc(foto)}
                alt="Foto de perfil"
                className="profile-photo"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                }}
              />
              <div className={`photo-menu ${isPhotoMenuOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="menu-btn remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Tem certeza que deseja remover sua foto de perfil?")) {
                      setEditData(prev => ({
                        ...prev,
                        foto: null,
                        fotoPreview: null
                      }));
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

            {/* Input escondido */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Tipo de usuário */}
          <div className="user-type-badge">
            <i className="fas fa-user"></i> Cliente
          </div>

          {/* Informações do perfil */}
          <div className="profile-info-card">
            <div className="info-item">
              <i className="fas fa-user"></i>
              <strong>Nome:</strong> {nome}
            </div>
            <div className="info-item">
              <i className="fas fa-envelope"></i>
              <strong>Email:</strong> {email}
            </div>
            <div className="info-item">
              <i className="fas fa-id-card"></i>
              <strong>CPF:</strong> {formatCPF(cpf)}
            </div>
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <strong>Endereço:</strong> {formatAddress(endereco)}
            </div>
          </div>

          {/* Botão Editar Perfil */}
          <button
            className="edit-profile-btn"
            onClick={() => setIsEditing(true)}
          >
            <i className="fas fa-edit"></i> Editar Perfil
          </button>
        </div>
      </div>

      {/* Modal de Edição */}
      {/* Modal de Edição */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsEditing(false)}
            >
              ×
            </button>
            <h2>Editar Perfil</h2>
            <form onSubmit={handleSubmit} className="edit-form">
              {/* Foto */}
              <div className="form-group">
                <label>Foto de Perfil</label>
                <div className="photo-upload">
                  <img
                    src={editData.fotoPreview || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+"}
                    alt="Preview"
                    className="photo-preview"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
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
                  value={editData.nome}
                  onChange={handleInputChange}
                  required
                />
              </div>



              {/* Senha */}
              <div className="form-group">
                <label>Nova Senha (opcional)</label>
                <input
                  type="password"
                  name="senha"
                  value={editData.senha}
                  onChange={handleInputChange}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>

              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  name="confirmarSenha"
                  value={editData.confirmarSenha}
                  onChange={handleInputChange}
                />
              </div>

              {/* Endereço - ESTILO IGUAL AO CADASTRO */}
              <h3>Endereço</h3>

              <input
                type="text"
                placeholder="CEP (00000-000)"
                value={editData.cep}
                onChange={handleCepChange}
                maxLength="9"
                className="endereco-input"
              />

              <input
                type="text"
                placeholder="Logradouro (rua, avenida...)"
                value={editData.rua}
                onChange={(e) => setEditData(prev => ({ ...prev, rua: e.target.value }))}
                className="endereco-input"
              />

              <input
                type="text"
                placeholder="Número"
                value={editData.numero}
                onChange={(e) => setEditData(prev => ({ ...prev, numero: e.target.value }))}
                className="endereco-input"
              />

              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={editData.complemento}
                onChange={(e) => setEditData(prev => ({ ...prev, complemento: e.target.value }))}
                className="endereco-input"
              />

              <input
                type="text"
                placeholder="Bairro"
                value={editData.bairro}
                onChange={(e) => setEditData(prev => ({ ...prev, bairro: e.target.value }))}
                className="endereco-input"
              />

              <input
                type="text"
                placeholder="Cidade"
                value={editData.cidade}
                onChange={(e) => setEditData(prev => ({ ...prev, cidade: e.target.value }))}
                className="endereco-input"
              />

              <input
                type="text"
                placeholder="Estado (SP, RJ...)"
                value={editData.estado}
                onChange={(e) => setEditData(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
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
  )
}
