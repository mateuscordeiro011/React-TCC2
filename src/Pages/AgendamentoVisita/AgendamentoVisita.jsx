import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./AgendamentoVisita.css";
import api from "../../service/api";

export default function AgendamentoVisita() {
  const { id } = useParams();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Carregar dados do animal
  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await fetch(`/api-salsi/animais/${id}`);
        if (!response.ok) throw new Error("Animal não encontrado");
        const data = await response.json();
        setAnimal(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();
  }, [id]);

  // Gerar horários disponíveis (9h às 17h)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    try {
      // Simular chamada à API de agendamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui você faria a chamada real:
      // await fetch(`${API_BASE_URL}/agendamentos`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     animalId: id,
      //     userId: user.id,
      //     dataVisita: `${selectedDate}T${selectedTime}`,
      //     status: 'agendado'
      //   })
      // });
      
      setSuccessMessage(true);
      setTimeout(() => navigate('/meus-agendamentos'), 2000);
    } catch (err) {
      setError("Erro ao agendar visita. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`agendamento-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando informações do animal...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`agendamento-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <Navbar />
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`agendamento-page ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Navbar />
      
      <section className="agendamento-hero">
        <div className="hero-content">
          <h1>📅 Agendar Visita</h1>
          <p>Conheça {animal.nome} antes de adotar!</p>
        </div>
      </section>

      <section className="agendamento-container">
        <div className="animal-preview">
          <div className="animal-image">
            <img 
              src={animal.imagem || "/default-pet.png"} 
              alt={animal.nome} 
            />
          </div>
          <div className="animal-info">
            <h2>{animal.nome}</h2>
            <p><strong>Espécie:</strong> {animal.especie}</p>
            <p><strong>Raça:</strong> {animal.raca || "Não informado"}</p>
            <p><strong>Porte:</strong> {animal.porte}</p>
            <p><strong>Idade:</strong> {animal.idade}</p>
          </div>
        </div>

        <form className="agendamento-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date">Escolha a data da visita:</label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Escolha o horário:</label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="time-select"
              disabled={!selectedDate}
            >
              <option value="">Selecione um horário</option>
              {generateTimeSlots().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={!selectedDate || !selectedTime || isSubmitting}
          >
            {isSubmitting ? (
              <span className="button-content">
                <span className="spinner"></span>
                Agendando...
              </span>
            ) : (
              "Confirmar Visita"
            )}
          </button>
        </form>
      </section>

      {successMessage && (
        <div className="success-overlay">
          <div className="success-content">
            <div className="checkmark">
              <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h3>Visita agendada com sucesso!</h3>
            <p>Você receberá um e-mail com os detalhes da visita.</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}