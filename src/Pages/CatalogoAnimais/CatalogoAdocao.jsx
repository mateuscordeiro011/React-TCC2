import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../utils/useAuth";
import { useAnimals } from "../../hooks/useAnimals";
import AnimalCard from "../../components/AnimalCard/AnimalCard";
import AnimalModal from "../../components/AnimalModal/AnimalModal";
import LoginRequiredModal from "../../components/LoginRequiredModal/LoginRequiredModal";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import "./CatalogoAdocao.css";

export default function CatalogoAdocao() {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAnimalModal, setShowAnimalModal] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const { animals, loading, error } = useAnimals();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [filters, setFilters] = useState({
    especie: "",
    raca: "",
    porte: "",
    sexo: "",
    searchTerm: ""
  });
  const [sortOption, setSortOption] = useState("nome");

const handleAdopt = (animal) => {
  if (!user) {
    setShowLoginModal(true);
    return;
  }

  console.log("Tentando adotar animal:", animal);

  if (animal.id == null) {
    alert("Erro: este animal não tem ID válido.");
    return;
  }

  navigate(`/agendamento-visita/temp`, { state: { animal } });
};
  const handleOpenModal = (animal) => {
    setSelectedAnimal(animal);
    setShowAnimalModal(true);
  };

  const handleCloseModal = () => {
    setShowAnimalModal(false);
    setSelectedAnimal(null);
  };

  const filteredAndSortedItems = animals
    .filter(animal => {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (!animal.nome.toLowerCase().includes(term) &&
          !animal.especie.toLowerCase().includes(term) &&
          !animal.raca.toLowerCase().includes(term)) {
          return false;
        }
      }
      if (filters.especie && animal.especie !== filters.especie) return false;
      if (filters.raca && animal.raca !== filters.raca) return false;
      if (filters.porte && animal.porte !== filters.porte) return false;
      if (filters.sexo && animal.sexo !== filters.sexo) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOption === "nome") {
        const nomeA = a.nome || "";
        const nomeB = b.nome || "";
        return nomeA.localeCompare(nomeB);
      }
      if (sortOption === "idade-asc") {
        const dateA = a.idadeNumerica ?? Infinity;
        const dateB = b.idadeNumerica ?? Infinity;
        return dateA - dateB;
      }
      if (sortOption === "idadeNumerica-desc") {
        const dateA = a.idadeNumerica ?? -Infinity;
        const dateB = b.idadeNumerica ?? -Infinity;
        return dateB - dateA;
      }
      return 0;
    })

  const especies = [...new Set(animals.map(a => a.especie))];
  const racas = [...new Set(animals.map(a => a.raca).filter(Boolean))];
  const portes = ["Pequeno", "Médio", "Grande"];
  const sexos = ["Macho", "Fêmea"];

  return (
    <>
      <div className={`catalogo-page ${darkMode ? "dark-mode" : "light-mode"}`}>

        <section className="catalogo-hero">
          <div className="hero-content">
            <h1>🐾 Catálogo de Adoção</h1>
            <p>Encontre seu novo melhor amigo</p>
          </div>
        </section>

        <section className="catalogo-filters">
          <div className="filters-container">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Buscar por nome, espécie ou raça..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.especie}
                onChange={(e) => setFilters({ ...filters, especie: e.target.value })}
                className="filter-select"
              >
                <option value="">Todas as espécies</option>
                {especies.map(especie => (
                  <option key={especie} value={especie}>{especie}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.raca}
                onChange={(e) => setFilters({ ...filters, raca: e.target.value })}
                className="filter-select"
              >
                <option value="">Todas as raças</option>
                {racas.map(raca => (
                  <option key={raca} value={raca}>{raca}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.porte}
                onChange={(e) => setFilters({ ...filters, porte: e.target.value })}
                className="filter-select"
              >
                <option value="">Todos os portes</option>
                {portes.map(porte => (
                  <option key={porte} value={porte}>{porte}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={filters.sexo}
                onChange={(e) => setFilters({ ...filters, sexo: e.target.value })}
                className="filter-select"
              >
                <option value="">Todos os sexos</option>
                {sexos.map(sexo => (
                  <option key={sexo} value={sexo}>{sexo}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="filter-select"
              >
                <option value="nome">Ordenar por nome</option>
                <option value="idade-asc">Mais jovem</option>
                <option value="idade-desc">Mais velho</option>
              </select>
            </div>
          </div>
        </section>

        {/* Resultados */}
        <section className="catalogo-results">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando animais...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">⚠️ {error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Tentar novamente
              </button>
            </div>
          ) : filteredAndSortedItems.length === 0 ? (
            <div className="no-results">
              <h3>😔 Nenhum animal disponível</h3>
              <p>Tente ajustar seus filtros</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <p>{filteredAndSortedItems.length} animais encontrados</p>
              </div>
              <div className="catalogo-grid">
                {filteredAndSortedItems.map((animal) => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    onAdopt={handleAdopt}
                    onViewDetails={handleOpenModal}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Modais */}
        <AnimalModal
          animal={selectedAnimal}
          onClose={handleCloseModal}
          onAdopt={handleAdopt}
        />

        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
      <Footer />
    </>
  );
}