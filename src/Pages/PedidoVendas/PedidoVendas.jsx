import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./PedidoVendas.css";
import Footer from "../../components/Footer/Footer";

export default function PedidosVendas() {
    const { darkMode } = useTheme();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [filtroData, setFiltroData] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const carregarPedidos = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:8080/api-salsi/pedidos", {
                    credentials: "include",
                });
                
                if (response.ok) {
                    const data = await response.json();
                    // Filtrar apenas pedidos de clientes (não funcionários)
                    const pedidosClientes = Array.isArray(data) ? data.filter(pedido => pedido.cliente) : [];
                    setPedidos(pedidosClientes);
                } else {
                    throw new Error('Erro ao carregar pedidos');
                }
            } catch (err) {
                setError(err.message);
                setPedidos([]);
            } finally {
                setLoading(false);
            }
        };

        carregarPedidos();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Data não disponível';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
        } catch (e) {
            return 'Data inválida';
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDENTE': '#FF9800',
            'CONFIRMADO': '#2196F3',
            'ENVIADO': '#9C27B0',
            'ENTREGUE': '#4CAF50',
            'CANCELADO': '#F44336'
        };
        return colors[status] || '#666';
    };

    const atualizarStatus = async (pedidoId, novoStatus) => {
        try {
            const response = await fetch(`http://localhost:8080/api-salsi/pedidos/${pedidoId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: novoStatus })
            });

            if (response.ok) {
                setPedidos(prev => prev.map(pedido => 
                    pedido.id === pedidoId ? { ...pedido, status: novoStatus } : pedido
                ));
            } else {
                alert('Erro ao atualizar status do pedido');
            }
        } catch (err) {
            alert('Erro ao atualizar status: ' + err.message);
        }
    };

    const pedidosFiltrados = pedidos.filter(pedido => {
        const matchStatus = filtroStatus === 'TODOS' || pedido.status === filtroStatus;
        const matchData = !filtroData || pedido.dataPedido?.includes(filtroData);
        const matchSearch = !searchTerm || 
            pedido.id?.toString().includes(searchTerm) ||
            pedido.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pedido.cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchStatus && matchData && matchSearch;
    });

    const totalVendas = pedidosFiltrados.reduce((sum, pedido) => sum + (pedido.total || 0), 0);

    if (loading) {
        return (
            <div className={`pedidos-vendas-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando pedidos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`pedidos-vendas-page ${darkMode ? "dark-mode" : "light-mode"}`}>
                <div className="error-container">
                    <h2>Erro ao carregar dados</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`pedidos-vendas-page ${darkMode ? "dark-mode" : "light-mode"}`}>
            <div className="pedidos-vendas-container">
                <header className="page-header">
                    <h1>Pedidos e Vendas</h1>
                    <p>Visualize e gerencie todos os pedidos realizados pelos clientes</p>
                </header>

                <div className="filters-section">
                    <div className="filter-group">
                        <label>Status:</label>
                        <select 
                            value={filtroStatus} 
                            onChange={(e) => setFiltroStatus(e.target.value)}
                        >
                            <option value="TODOS">Todos</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="CONFIRMADO">Confirmado</option>
                            <option value="ENVIADO">Enviado</option>
                            <option value="ENTREGUE">Entregue</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Data:</label>
                        <input 
                            type="date" 
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Buscar:</label>
                        <input 
                            type="text" 
                            placeholder="ID, nome ou email do cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="stats-section">
                    <div className="stat-card">
                        <h3>Total de Pedidos</h3>
                        <span className="stat-number">{pedidosFiltrados.length}</span>
                    </div>
                    <div className="stat-card">
                        <h3>Total em Vendas</h3>
                        <span className="stat-number">{formatCurrency(totalVendas)}</span>
                    </div>
                </div>

                <div className="pedidos-list">
                    {pedidosFiltrados.length === 0 ? (
                        <div className="empty-state">
                            <p>Nenhum pedido encontrado com os filtros aplicados.</p>
                        </div>
                    ) : (
                        pedidosFiltrados.map(pedido => (
                            <div key={pedido.id} className="pedido-card">
                                <div className="pedido-header">
                                    <div className="pedido-info">
                                        <h3>Pedido #{pedido.id}</h3>
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(pedido.status) }}
                                        >
                                            {pedido.status}
                                        </span>
                                    </div>
                                    <div className="pedido-total">
                                        {formatCurrency(pedido.total)}
                                    </div>
                                </div>

                                <div className="pedido-details">
                                    <div className="cliente-info">
                                        <strong>Cliente:</strong> {pedido.cliente?.nome || 'N/A'}
                                        <br />
                                        <strong>Email:</strong> {pedido.cliente?.email || 'N/A'}
                                    </div>
                                    
                                    <div className="pedido-meta">
                                        <p><strong>Data:</strong> {formatDateTime(pedido.dataPedido)}</p>
                                        <p><strong>Endereço:</strong> {pedido.enderecoEntrega || 'N/A'}</p>
                                        <p><strong>Frete:</strong> {formatCurrency(pedido.valorFrete || 0)}</p>
                                    </div>
                                </div>

                                <div className="pedido-actions">
                                    {pedido.status === 'PENDENTE' && (
                                        <button 
                                            className="btn-entregar"
                                            onClick={() => atualizarStatus(pedido.id, 'ENTREGUE')}
                                        >
                                            Marcar como Entregue
                                        </button>
                                    )}
                                </div>

                                {pedido.itens && pedido.itens.length > 0 && (
                                    <div className="itens-pedido">
                                        <h4>Itens do Pedido:</h4>
                                        <div className="itens-list">
                                            {pedido.itens.map((item, index) => (
                                                <div key={index} className="item-row">
                                                    <span className="item-nome">{item.produto?.nome || 'Produto'}</span>
                                                    <span className="item-quantidade">Qtd: {item.quantidade}</span>
                                                    <span className="item-preco">{formatCurrency(item.precoUnitario)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}