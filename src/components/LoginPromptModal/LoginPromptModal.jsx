import { useNavigate } from "react-router-dom";
import "./LoginPromptModal.css";

export default function LoginPromptModal({ isOpen, onClose }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        navigate('/login');
    };

    const handleRegister = () => {
        onClose();
        navigate('/register');
    };

    return (
        <div className="login-prompt-overlay" onClick={onClose}>
            <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
                <button className="login-prompt-close" onClick={onClose}>×</button>

                <div className="login-prompt-content">
                    <div className="login-prompt-icon">🔒</div>
                    <h2>Acesso Necessário</h2>
                    <p>Para continuar, você precisa estar logado em sua conta.</p>

                    <div className="login-prompt-actions">
                        <button className="login-prompt-btn login" onClick={handleLogin}>
                            👤 FAZER LOGIN
                        </button>
                        <button className="login-prompt-btn register" onClick={handleRegister}>
                            ✏️ CRIAR CONTA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
