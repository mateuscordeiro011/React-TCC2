import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./EmployeeDashboard.css";
import Footer from "../../components/Footer/Footer";

export default function EmployeeDashboard() {
    const { darkMode } = useTheme();
    const [adoptions, setAdoptions] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [products, setProducts] = useState([]);
    const [clients, setClients] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalAnimals: 0,
        totalProducts: 0,
        totalClients: 0,
        totalSales: 0,
        recentActivities: 0
    });

    // Função para tratar imagens Base64
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
            return fallbackSVG;
        }
    };

    // Calcular idade
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

    // Carregar todos os dados
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Carregar animais (funcionários + doações de clientes)
                try {
                    const [animaisRes, doacoesRes] = await Promise.all([
                        fetch("http://localhost:8080/api-salsi/animais"),
                        fetch("http://localhost:8080/api-salsi/doacoes/disponiveis")
                    ]);
                    
                    let allAnimals = [];
                    
                    if (animaisRes.ok) {
                        const animaisData = await animaisRes.json();
                        allAnimals = [...allAnimals, ...(Array.isArray(animaisData) ? animaisData : [])];
                    }
                    
                    if (doacoesRes.ok) {
                        const doacoesData = await doacoesRes.json();
                        allAnimals = [...allAnimals, ...(Array.isArray(doacoesData) ? doacoesData : [])];
                    }
                    
                    setAdoptions(allAnimals);
                } catch (err) {
                    console.warn("Erro ao carregar animais:", err);
                    setAdoptions([]);
                }

                // Carregar produtos
                try {
                    const productsRes = await fetch("http://localhost:8080/api-salsi/produtos", {
                        credentials: "include",
                    });
                    if (productsRes.ok) {
                        const productsData = await productsRes.json();
                        setProducts(Array.isArray(productsData) ? productsData : []);
                    }
                } catch (err) {
                    console.warn("Erro ao carregar produtos:", err);
                    setProducts([]);
                }

                // Carregar pedidos
                try {
                    const purchasesRes = await fetch("http://localhost:8080/api-salsi/pedidos", {
                        credentials: "include",
                    });
                    if (purchasesRes.ok) {
                        const purchasesData = await purchasesRes.json();
                        setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
                    }
                } catch (err) {
                    console.warn("Erro ao carregar pedidos:", err);
                    setPurchases([]);
                }

                // Carregar clientes
                try {
                    const clientsRes = await fetch("http://localhost:8080/api-salsi/clientes", {
                        credentials: "include",
                    });
                    if (clientsRes.ok) {
                        const clientsData = await clientsRes.json();
                        setClients(Array.isArray(clientsData) ? clientsData : []);
                    }
                } catch (err) {
                    console.warn("Erro ao carregar clientes:", err);
                    setClients([]);
                }

                // Carregar logs da API
                try {
                    const logsRes = await fetch("http://localhost:8080/api-salsi/logs/recentes");
                    if (logsRes.ok) {
                        const logsData = await logsRes.json();
                        setLogs(Array.isArray(logsData) ? logsData : []);
                    } else {
                        setLogs([]);
                    }
                } catch (err) {
                    console.warn("Erro ao carregar logs:", err);
                    setLogs([]);
                }

            } catch (err) {
                console.error("Erro geral:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    // Calcular estatísticas
    useEffect(() => {
        setStats({
            totalAnimals: adoptions.length,
            totalProducts: products.length,
            totalClients: clients.length,
            totalSales: purchases.reduce((sum, p) => sum + (p.total || 0), 0),
            recentActivities: logs.length
        });
    }, [adoptions, products, clients, purchases, logs]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const getStatusColor = (status) => {
        const colors = {
            'CONCLUÍDA': '#4CAF50',
            'PENDENTE': '#FF9800',
            'EM_ANDAMENTO': '#2196F3',
            'ATIVO': '#4CAF50',
            'CANCELADA': '#F44336'
        };
        return colors[status] || '#666';
    };

    const getActionIcon = (tipo) => {
        const icons = {
            'COMPRA': '🛒',
            'DOACAO': '🐾',
            'ADOCAO': '❤️',
            'CADASTRO': '👤',
            'PRODUTO': '📦'
        };
        return icons[tipo] || '📋';
    };

    if (loading) {
        return (
            <div className={`employee-dashboard-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="employee-dashboard">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Carregando dados do sistema...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`employee-dashboard-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="employee-dashboard">
                    <header className="dashboard-header">
                        <h1>📊 Dashboard do Funcionário</h1>
                        <p>Visão completa das atividades do sistema</p>
                    </header>

                    {/* Estatísticas Gerais */}
                    <section className="stats-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">🐾</div>
                                <div className="stat-info">
                                    <h3>{stats.totalAnimals}</h3>
                                    <p>Animais Cadastrados</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <h3>{stats.totalProducts}</h3>
                                    <p>Produtos Disponíveis</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>{stats.totalClients}</h3>
                                    <p>Clientes Cadastrados</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>{formatCurrency(stats.totalSales)}</h3>
                                    <p>Total em Vendas</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Navegação por Abas */}
                    <nav className="dashboard-tabs">
                        <button 
                            className={activeTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveTab('overview')}
                        >
                            📋 Visão Geral
                        </button>
                        <button 
                            className={activeTab === 'logs' ? 'active' : ''}
                            onClick={() => setActiveTab('logs')}
                        >
                            📝 Log de Atividades
                        </button>
                    </nav>

                    {/* Conteúdo das Abas */}
                    <div className="tab-content">
                        {/*Visão Geral */}
                        {activeTab === 'overview' && (
                            <section className="overview-section">
                                <h2>📊 Resumo das Atividades</h2>
                                <div className="overview-grid">
                                    <div className="overview-card">
                                        <h3>🔥 Atividades Recentes</h3>
                                        <div className="recent-activities">
                                            {logs.slice(0, 5).map(log => (
                                                <div key={log.id} className="activity-item">
                                                    <span className="activity-icon">{getActionIcon(log.tipo_acao)}</span>
                                                    <div className="activity-details">
                                                        <p><strong>{log.usuario_nome}</strong> - {log.descricao}</p>
                                                        <small>{formatDateTime(log.data_hora)}</small>
                                                    </div>
                                                    <span 
                                                        className="activity-status"
                                                        style={{ color: getStatusColor(log.status) }}
                                                    >
                                                        {log.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Log de Atividades */}
                        {activeTab === 'logs' && (
                            <section className="logs-section">
                                <h2>📝 Log Completo de Atividades</h2>
                                <div className="logs-container">
                                    {logs.length === 0 ? (
                                        <p>Nenhuma atividade registrada.</p>
                                    ) : (
                                        logs.map(log => (
                                            <div key={log.id} className="log-item">
                                                <div className="log-header">
                                                    <span className="log-icon">{getActionIcon(log.tipo_acao)}</span>
                                                    <div className="log-info">
                                                        <h4>{log.tipo_acao}</h4>
                                                        <p><strong>Usuário:</strong> {log.usuario_nome}</p>
                                                    </div>
                                                    <div className="log-meta">
                                                        <span 
                                                            className="log-status"
                                                            style={{ backgroundColor: getStatusColor(log.status) }}
                                                        >
                                                            {log.status}
                                                        </span>
                                                        <small>{formatDateTime(log.data_hora)}</small>
                                                    </div>
                                                </div>
                                                <div className="log-description">
                                                    <p>{log.descricao}</p>
                                                    {log.valor && (
                                                        <p className="log-value">
                                                            <strong>Valor:</strong> {formatCurrency(log.valor)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}