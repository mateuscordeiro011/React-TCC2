// src/routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./utils/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import DynamicLayout from "./components/Layouts/DynamicLayout";
import AuthLayout from "./components/Layouts/AuthLayouts";

// Home
import Home from "./Pages/Home/Home";
import HomeFuncionario from "./Pages/Home/HomeFuncionario";
import HomeCliente from "./Pages/Home/HomeClient"

// Cadastros
import FormProduto from "./Pages/Cadastros/FormProduto/FormProduto";
import FormAnimal from "./Pages/Cadastros/FormAnimal/FormAnimal";
import DoarAnimal from "./Pages/Cadastros/FormDoarAnimal/DoarAnimal";
import DoarAnimalFuncionario from "./Pages/Cadastros/FormDoarAnimal/DoarAnimalFuncionario";

// Catálogos
import CatalogoProdutos from "./Pages/CatalogoProduto/CatalogoProduto";
import ProdutoDetalhes from "./Pages/ProdutoDetalhes/ProdutoDetalhes";
import CatalogoAdocao from "./Pages/CatalogoAnimais/CatalogoAdocao";
import AgendamentoVisita from "./Pages/AgendamentoVisita/AgendamentoVisita";

// Carrinho 
import Carrinho from "./Pages/Carrinho/Carrinho";

// Perfil
import PerfilCliente from "./Pages/Perfil/Cliente/PerfilCliente";
import PerfilFuncionario from "./Pages/Perfil/Funcionario/PerfilFuncionario";

// Checkout
import Checkout from "./Pages/Checkout/Checkout";
import OrderConfirmation from "./Pages/OrderConfirmation/OrderConfirmation";
import EmployeeDashboard from "./Pages/EmployeeDashboard/EmployeeDashboard";
import PedidosVendas from "./Pages/PedidoVendas/PedidoVendas";

// Configurações
import Configuracoes from "./Pages/Configuracoes/Configuracoes";

// Autenticação
import Login from "./Pages/Login/Login";
import Registro from "./Pages/Registro/Registro";
import EnderecoCadastro from "./Pages/EnderecoCadastro/EnderecoCadastro";
import RecuperarSenha from "./Pages/RecuperarSenha/RecuperarSenha";

// Erro
import AcessoNegado from "./Pages/AcessoNegado";

function RoutesApp() {
  const { isAuthenticated, isFuncionario } = useAuth();

  return (
    <Routes>
      {/* Rota raiz: comportamento dinâmico baseado na autenticação */}
      <Route
        path="/"
        element={
          <DynamicLayout>
            {!isAuthenticated ? (
              <Home />
            ) : isFuncionario ? (
              <Navigate to="/home-funcionario" replace />
            ) : (
              <HomeCliente />
            )}
          </DynamicLayout>
        }
      />

      {/* Rotas públicas com layout público */}
      <Route
        path="/catalogo-produto"
        element={
          <DynamicLayout>
            <CatalogoProdutos />
          </DynamicLayout>
        }
      />
      <Route
        path="/produto/:id"
        element={
          <DynamicLayout>
            <ProdutoDetalhes />
          </DynamicLayout>
        }
      />
      <Route
        path="/catalogo-adocao"
        element={
          <DynamicLayout>
            <CatalogoAdocao />
          </DynamicLayout>
        }
      />
      <Route
        path="/endereco-cadastro"
        element={
          <AuthLayout>
            <EnderecoCadastro />
          </AuthLayout>
        }
      />

      {/* Rotas de autenticação: SEM navbar */}
      <Route
        path="/login"
        element={
          <AuthLayout>
            {isAuthenticated ? (
              isFuncionario ? (
                <Navigate to="/home-funcionario" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <Login />
            )}
          </AuthLayout>
        }
      />
      <Route path="/registro" element={<AuthLayout><Registro /></AuthLayout>} />
      <Route path="/recuperar-senha" element={<AuthLayout><RecuperarSenha /></AuthLayout>} />

      {/* Rotas protegidas: CLIENTE */}
      <Route
        path="/carrinho"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <Carrinho />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <Checkout />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/pedido-confirmado"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <OrderConfirmation />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/formdoacao"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <DoarAnimal />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/perfil-cliente"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <PerfilCliente />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/agendamento-visita/:id"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <AgendamentoVisita />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />

      {/* Rotas protegidas: FUNCIONÁRIO */}
      <Route
        path="/home-funcionario"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <HomeFuncionario />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />

      <Route
        path="/relatorio"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
            <Route
        path="/perfil-funcionario"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <PerfilFuncionario />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/formproduto"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <FormProduto />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/formanimal"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <FormAnimal />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
      <Route
        path="/formdoacao-funcionario"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <DoarAnimalFuncionario />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />
            <Route
        path="/pedidos-vendas"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
              <PedidosVendas />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />

      {/* Configurações: ambos os papéis */}
      <Route
        path="/configuracoes"
        element={
          <DynamicLayout>
            <ProtectedRoute allowedRoles={['CLIENTE', 'FUNCIONARIO']}>
              <Configuracoes />
            </ProtectedRoute>
          </DynamicLayout>
        }
      />

      {/* Página de erro */}
      <Route
        path="/acesso-negado"
        element={
          <DynamicLayout>
            <AcessoNegado />
          </DynamicLayout>
        }
      />

      {/* Redirecionamento de rotas inválidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RoutesApp;