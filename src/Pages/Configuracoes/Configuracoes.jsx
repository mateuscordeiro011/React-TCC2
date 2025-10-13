import { useState, useEffect } from "react";
import { useAuth } from "../../utils/useAuth";
import { useTheme } from "../../context/ThemeContext";
import Footer from "../../components/Footer/Footer";
import "./Configuracoes.css";

export default function Configuracoes() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("localNotes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.warn("Erro ao carregar notas:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("localNotes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!newNote.trim()) return;
    const updated = [...notes, { id: Date.now(), text: newNote }];
    setNotes(updated);
    setNewNote("");
    setMensagem({ tipo: "sucesso", texto: "Nota adicionada com sucesso!" });
    setTimeout(() => setMensagem(null), 3000);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    setMensagem({ tipo: "erro", texto: "Nota removida!" });
    setTimeout(() => setMensagem(null), 3000);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setEditText(note.text);
    setIsDialogOpen(true);
  };

  const saveEdit = () => {
    setNotes(
      notes.map((n) => (n.id === editingNote.id ? { ...n, text: editText } : n))
    );
    setIsDialogOpen(false);
    setEditingNote(null);
    setMensagem({ tipo: "sucesso", texto: "Nota atualizada com sucesso!" });
    setTimeout(() => setMensagem(null), 3000);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className={`configuracoes-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        {mensagem && (
          <div className={`popup ${mensagem.tipo}`}>
            <p>{mensagem.texto}</p>
            <button onClick={() => setMensagem(null)}>Fechar</button>
          </div>
        )}

        <div className="local-notes-container">
          <h1>Minhas Configurações</h1>

          {/* Conta */}
          <div className="config-section">
            <h2>Conta</h2>
            <div className="config-item">
              <span>Nome:</span>
              <strong>{user?.nome || "Não disponível"}</strong>
            </div>
            <div className="config-item">
              <span>Email:</span>
              <strong>{user?.email || "Não disponível"}</strong>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Sair da conta
            </button>
          </div>

          {/* Aparência */}
          <div className="config-section">
            <h2>Aparência</h2>
            <div className="config-item theme-toggle">
              <span>Tema:</span>
              <button
                className="theme-toggle-btn"
                onClick={toggleTheme}
                aria-label={darkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
                title={darkMode ? "Modo Claro" : "Modo Escuro"}
              >
                {darkMode ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
              </button>
            </div>
          </div>

          {/*Notificações (não funcional) */}
          <div className="config-section">
            <h2>Notificações</h2>
            <div className="config-item">
              <span>Email:</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="config-item">
              <span>Push:</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/*Privacidade (não funcional) */}
          <div className="config-section">
            <h2>Privacidade</h2>
            <div className="config-item">
              <span>Perfil público:</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
            <div className="config-item">
              <span>Compartilhar dados com parceiros:</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/*Idioma (não funcional) */}
          <div className="config-section">
            <h2>Idioma</h2>
            <div className="config-item">
              <span>Idioma do sistema:</span>
              <select defaultValue="pt-BR" disabled>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </div>

          {/*Minhas Notas Locais */}
          <div className="config-section">
            <h2>Minhas Notas Locais</h2>
            <div className="local-notes-input">
              <input
                type="text"
                placeholder="Digite uma nova nota..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button onClick={addNote}>Adicionar</button>
            </div>

            <div className="local-notes-list">
              {notes.length === 0 ? (
                <p className="no-notes">Nenhuma nota salva ainda.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="note-card">
                    <p className="note-text">{note.text}</p>
                    <div className="note-actions">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(note)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteNote(note.id)}
                        title="Excluir"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal de Edição */}
        {isDialogOpen && (
          <div className="modal-overlay" onClick={() => setIsDialogOpen(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="dialog-title">Editar Nota</h3>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="edit-input"
                placeholder="Edite o conteúdo da nota"
              />
              <div className="dialog-footer">
                <button onClick={saveEdit}>Salvar</button>
                <button onClick={() => setIsDialogOpen(false)} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}