// src/components/LoginSuccessModal.jsx
import { motion } from "framer-motion";
import { useEffect } from "react";
import { CheckCircle, User, Shield, PawPrint, Heart } from "lucide-react";
import "./LoginSuccessModal.css";

const LoginSuccessModal = ({ user, onClose }) => {
  const isFuncionario = user.tipo === "FUNCIONARIO";

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="login-success-overlay">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`login-success-modal ${isFuncionario ? "funcionario" : "cliente"}`}
      >
        <div className="icon-wrapper">
          {isFuncionario ? (
            <Shield size={48} className="icon" />
          ) : (
            <Heart size={48} className="icon" fill="currentColor" />
          )}
          <CheckCircle size={24} className="check-icon" />
        </div>

        <h2>Bem-vindo{isFuncionario ? 'a' : ''}, {user.nome}!</h2>

        <div className="badge">
          {isFuncionario ? (
            <>
              <Shield size={16} />
              <span>Conta Funcionário</span>
            </>
          ) : (
            <>
              <PawPrint size={16} />
              <span>Conta Cliente</span>
            </>
          )}
        </div>

        <p className="message">
          {isFuncionario
            ? "Você tem acesso ao painel administrativo. Gerencie produtos, animais e doações."
            : "Seu lar está prestes a ficar mais feliz! 💖 Encontre seu novo amigo para adoção ou compre produtos para seu pet."}
        </p>

        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSuccessModal;