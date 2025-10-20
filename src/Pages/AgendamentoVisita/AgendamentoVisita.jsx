import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import { useNavigate, useParams } from "react-router-dom";
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

  const calculateAge = (dataNascimento) => {
    if (!dataNascimento) return "Idade não informada";
    const birthDate = new Date(dataNascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} anos` : "Recém-nascido";
  };

useEffect(() => {
  // Debug
  console.log("Parâmetro animalId:", id);

  if (!id || id === "undefined" || id === "null") {
    setError("ID do animal inválido.");
    setLoading(false);
    return;
  }

  const idNumber = Number(id);
  if (isNaN(idNumber) || idNumber <= 0) {
    setError("ID do animal inválido.");
    setLoading(false);
    return;
  }

  const fetchAnimal = async () => {
    try {
      const response = await api.get(`/api-salsi/animais/${idNumber}`);
      const animalData = response.data;

      const idadeExibicao = calculateAge(animalData.nascimento);
      
      setAnimal({
        id: animalData.id,
        Nome: animalData.nome,       
        Especie: animalData.especie,
        Raca: animalData.raca,
        porte: animalData.peso
          ? animalData.peso < 10 ? "Pequeno" : animalData.peso < 25 ? "Médio" : "Grande"
          : "Não informado",
        idade: idadeExibicao,
        Sexo: animalData.sexo === "M" ? "Macho" : "Fêmea",
        peso: animalData.peso,
        foto: animalData.foto,
        descricao: animalData.descricao || `Espécie: ${animalData.especie}. Raça: ${animalData.raca}.`
      });
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar animal:", err);
      setError("Animal não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  fetchAnimal(); 
}, [id]);

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
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const dataVisita = `${selectedDate} às ${selectedTime}`;
      
      await api.post('/api-salsi/agendamentos/visita', {
        animalId: id,
        clienteId: user.id,
        dataVisita: dataVisita
      });

      setSuccessMessage(true);
      setTimeout(() => navigate('/catalogo-adocao'), 3000);
    } catch (err) {
      console.error('Erro ao agendar visita:', err);
      setError("Erro ao agendar visita. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`agendamento-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando informações do animal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`agendamento-page ${darkMode ? "dark-mode" : "light-mode"}`}>
        <div className="error-container">
          <p className="error-message">⚠️ {error}</p>
          <button
            className="retry-button"
            onClick={() => navigate('/catalogo-adocao')}
          >
            Voltar para o catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`agendamento-page ${darkMode ? "dark-mode" : "light-mode"}`}>
      <section className="agendamento-hero">
        <div className="hero-content">
          <h1>📅 Agendar Visita</h1>
          <p>Conheça {animal.Nome} antes de adotar!</p>
        </div>
      </section>

      <section className="agendamento-container">
        <div className="animal-preview">
          <div className="animal-image">
            <img
              src={animal.foto ? `data:image/jpeg;base64,${animal.foto}` : "/default-pet.png"}
              alt={animal.Nome}
            />
          </div>
          <div className="animal-info">
            <h2>{animal.Nome}</h2>
            <div className="info-grid">
              <p><strong>Espécie:</strong> {animal.Especie}</p>
              <p><strong>Raça:</strong> {animal.Raca || "Não informado"}</p>
              <p><strong>Porte:</strong> {animal.porte}</p>
              <p><strong>Idade:</strong> {animal.idade}</p>
              <p><strong>Sexo:</strong> {animal.Sexo || "Não informado"}</p>
              <p><strong>Peso:</strong> {animal.peso ? `${animal.peso} kg` : "Não informado"}</p>
            </div>
            {animal.descricao && (
              <div className="animal-description">
                <h3>Sobre {animal.Nome}:</h3>
                <p>{animal.descricao}</p>
              </div>
            )}
            {animal.observacoes && (
              <div className="animal-observations">
                <h3>Observações importantes:</h3>
                <p>{animal.observacoes}</p>
              </div>
            )}
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
            {isSubmitting ? "Agendando..." : "Confirmar Visita"}
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
            <p>Você receberá um e-mail com os detalhes.</p>
          </div>
        </div>
      )}
    </div>
  );
}