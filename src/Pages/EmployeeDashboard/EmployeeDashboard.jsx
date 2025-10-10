import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./EmployeeDashboard.css";
import Footer from "../../components/Footer/Footer";

export default function EmployeeDashboard() {
    const { darkMode } = useTheme();
    const [adoptions, setAdoptions] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 🔁 Função para tratar imagens Base64 (idêntica à Home.jsx)
    const getBase64ImageSrc = (imageData) => {
        const fallbackSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";

        if (!imageData) return fallbackSVG;
        const str = String(imageData).trim();
        if (str === "") return fallbackSVG;

        if (str.startsWith('data:image/')) return str;
        if (str.startsWith('http')) return fallbackSVG;

        if (str.startsWith("iVBOR")) return `data:image/png;base64,${str}`;
        if (str.startsWith("R0lGO")) return `data:image/gif;base64,${str}`;
        if (str.startsWith("/9j/")) return `data:image/jpeg;base64,${str}`;

        try {
            atob(str);
            return `data:image/jpeg;base64,${str}`;
        } catch (e) {
            console.error("Base64 inválido:", e.message);
            return fallbackSVG;
        }
    };

    // Calcular idade (igual à Home)
    const calculateAge = (birthDate) => {
        if (!birthDate) return "Desconhecida";
        const dob = new Date(birthDate);
        if (isNaN(dob.getTime())) return "Desconhecida";
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
        return age;
    };

    // 🔁 Carregar dados (só adoções por enquanto)
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Adoções — ✅ SEMPRE EXISTE
                const adoptionsRes = await fetch("http://localhost:8080/api-salsi/animais", {
                    credentials: "include",
                });
                if (!adoptionsRes.ok) throw new Error(`Adoções: ${adoptionsRes.status}`);
                const adoptionsData = await adoptionsRes.json();
                setAdoptions(Array.isArray(adoptionsData) ? adoptionsData : []);

                // 2. Pedidos — ⚠️ OPCIONAL (pode não existir)
                try {
                    const purchasesRes = await fetch("http://localhost:8080/api-salsi/pedidos", {
                        credentials: "include",
                    });
                    if (purchasesRes.ok) {
                        const purchasesData = await purchasesRes.json();
                        setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
                    } else {
                        console.warn("Endpoint de pedidos não disponível. Status:", purchasesRes.status);
                        setPurchases([]); // Deixa vazio, mas não quebra
                    }
                } catch (err) {
                    console.warn("Não foi possível carregar pedidos:", err.message);
                    setPurchases([]); // Continua sem erro
                }

            } catch (err) {
                console.error("Erro ao carregar dados do funcionário:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    if (loading) {
        return (
            <div className={`employee-dashboard-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="employee-dashboard">
                    <p>Carregando ações dos clientes...</p>
                </div>
            </div>
        );
    }

    if (error && adoptions.length === 0 && purchases.length === 0) {
        return (
            <div className={`employee-dashboard-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="employee-dashboard">
                    <h2>❌ Erro ao carregar dados</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`employee-dashboard-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="employee-dashboard">
                    <h2>👁️ Visão do Funcionário</h2>
                    <p>Todas as ações recentes dos clientes estão listadas abaixo.</p>

                    {/* Seção: Adoções */}
                    <section className="action-section">
                        <h3>Adoções de Animais</h3>
                        {adoptions.length === 0 ? (
                            <p className="no-data">Nenhum animal disponível para adoção.</p>
                        ) : (
                            <div className="catalog-grid">
                                {adoptions.map((animal) => (
                                    <div key={animal.id_animal || animal.id} className="catalog-item">
                                        <img
                                            src={getBase64ImageSrc(animal.foto)}
                                            alt={animal.nome}
                                            className="catalog-item-image"
                                            onError={(e) => {
                                                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
                                            }}
                                        />
                                        <h3 className="catalog-item-title">{animal.nome}</h3>
                                        <p className="catalog-item-info">
                                            <strong>Espécie:</strong> {animal.especie || "—"}<br />
                                            <strong>Raça:</strong> {animal.raca || "—"}<br />
                                            <strong>Idade:</strong> {calculateAge(animal.data_nascimento || animal.nascimento)} anos<br />
                                            <strong>Peso:</strong> {animal.peso || "—"} kg<br />
                                            <strong>Sexo:</strong> {animal.sexo || "—"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Seção: Compras (Pedidos) — só aparece se houver dados */}
                    {purchases.length > 0 && (
                        <section className="action-section">
                            <h3>Compras Finalizadas</h3>
                            <div className="catalog-grid">
                                {purchases.map((pedido) => (
                                    <div key={pedido.id_pedido || pedido.id} className="catalog-item">
                                        <div className="catalog-item-image-placeholder">
                                            🛒
                                        </div>
                                        <h3 className="catalog-item-title">Pedido #{pedido.id_pedido || pedido.id}</h3>
                                        <p className="catalog-item-info">
                                            <strong>Cliente ID:</strong> {pedido.id_usuario || "—"}<br />
                                            <strong>Itens:</strong> {Array.isArray(pedido.itens) ? pedido.itens.length : "—"}<br />
                                            <strong>Total:</strong> R$ {Number(pedido.total || 0).toFixed(2)}<br />
                                            {pedido.data && (
                                                <>
                                                    <strong>Data:</strong> {new Date(pedido.data).toLocaleDateString("pt-BR")}<br />
                                                </>
                                            )}
                                            <strong>Status:</strong>{" "}
                                            <span className={`status ${pedido.status?.toLowerCase() || "processando"}`}>
                                                {pedido.status || "Processando"}
                                            </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}