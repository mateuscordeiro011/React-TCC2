import { useState, useEffect } from "react";

const calculateAge = (birthDate) => {
  if (!birthDate) return "Desconhecida";

  const dob = new Date(birthDate);
  if (isNaN(dob.getTime())) return "Desconhecida";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

export const useAnimals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch("http://localhost:8080/api-salsi/animais");
        if (!response.ok) {
          throw new Error("Falha ao carregar os animais.");
        }
        const data = await response.json();

        const formattedAnimals = data.map(animal => {
          const rawAge = calculateAge(animal.data_nascimento || animal.nascimento || animal.dataNascimento);

          const idadeExibicao = rawAge === "Desconhecida"
            ? "Idade desconhecida"
            : rawAge === 0
              ? "Menos de 1 ano"
              : `${rawAge} ${rawAge === 1 ? "ano" : "anos"}`;

          const idadeNumerica = typeof rawAge === 'number' ? rawAge : null;

          return {
            id: animal.id,
            nome: animal.nome || "Sem nome",
            especie: animal.especie || "Não informado",
            raca: animal.raca || "Sem raça definida",
            dataNascimento: animal.data_nascimento || animal.nascimento || animal.dataNascimento, 
            idade: idadeExibicao,
            idadeNumerica, // para ordenação
            sexo: animal.sexo === "M" ? "Macho" : animal.sexo === "F" ? "Fêmea" : "Não informado",
            porte: animal.peso
              ? animal.peso < 10
                ? "Pequeno"
                : animal.peso < 25
                  ? "Médio"
                  : "Grande"
              : "Não informado",
            peso: animal.peso,
            descricao: `Espécie: ${animal.especie || "não informada"}. Raça: ${
              animal.raca || "não informada"
            }. ${animal.peso ? `Peso: ${animal.peso} kg. ` : ""}Status: ${
              animal.Status || "Desconhecido"
            }.`,
            foto: animal.foto ? `data:image/jpeg;base64,${animal.foto}` : null,
            status: animal.Status || "Desconhecido"
          };
        });

        setAnimals(formattedAnimals);
      } catch (err) {
        console.error("Erro no hook useAnimals:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  return { animals, loading, error };
};