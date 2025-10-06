import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./utils/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Home
import Home from "./Pages/Home/Home";
import HomeFuncionario from "./Pages/Home/HomeFuncionario";

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

// Perfil
import PerfilCliente from "./Pages/Perfil/Cliente/PerfilCliente";

// Checkout
import Checkout from "./Pages/Checkout/Checkout";
import OrderConfirmation from "./Pages/OrderConfirmation/OrderConfirmation";

// Autenticação
import Login from "./Pages/Login/Login";
import Registro from "./Pages/Registro/Registro";
import EnderecoCadastro from "./Pages/EnderecoCadastro/EnderecoCadastro";
import RecuperarSenha from "./Pages/RecuperarSenha/RecuperarSenha";

// Erro
import AcessoNegado from "./Pages/AcessoNegado";
import { Import } from "lucide-react";

function RoutesApp() {
  const { isAuthenticated, isFuncionario } = useAuth();

  return (
    <Routes>
      {/* Rota raiz */}
      <Route
        path="/"
        element={
          isAuthenticated && isFuncionario ? (
            <Navigate to="/home-funcionario" replace />
          ) : (
            <Home />
          )
        }
      />

      {/* Rotas públicas */}
      <Route path="/registro" element={<Registro />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            isFuncionario ? (
              <Navigate to="/home-funcionario" replace />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/catalogo-produto" element={<CatalogoProdutos />} />
      <Route path="/produto/:id" element={<ProdutoDetalhes />} />
      <Route path="/catalogo-adocao" element={<CatalogoAdocao />} />

      {/* Rota de cadastro de endereço: pública, mas com verificação interna */}
      <Route path="/endereco-cadastro" element={<EnderecoCadastro />} />

      {/* Rotas protegidas: CLIENTE */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pedido-confirmado"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']}>
            <OrderConfirmation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/formdoacao"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']}>
            <DoarAnimal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil-cliente"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']}>
            <PerfilCliente />
          </ProtectedRoute>
        }
      />
            <Route
        path="/formulario-adocao/:id"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE']}>
            <AgendamentoVisita />
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas: FUNCIONÁRIO */}
      <Route
        path="/home-funcionario"
        element={
          <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
            <HomeFuncionario />
          </ProtectedRoute>
        }
      />
      <Route
        path="/formproduto"
        element={
          <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
            <FormProduto />
          </ProtectedRoute>
        }
      />
      <Route
        path="/formanimal"
        element={
          <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
            <FormAnimal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/formdoacao-funcionario"
        element={
          <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
            <DoarAnimalFuncionario />
          </ProtectedRoute>
        }
      />

      {/* Página de erro */}
      <Route path="/acesso-negado" element={<AcessoNegado />} />

      {/* Redirecionamento de rotas inválidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RoutesApp;