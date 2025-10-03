// src/Routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./utils/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

//Home cliente
import Home from "./Pages/Home/Home";

//Home Funcionario
import HomeFuncionario from "./Pages/Home/HomeFuncionario"

//Produto, animal e doação-funcionario apenas funcionario, doação cliente
import FormProduto from "./Pages/Cadastros/FormProduto/FormProduto";
import FormAnimal from "./Pages/Cadastros/FormAnimal/FormAnimal";
import DoarAnimal from "./Pages/Cadastros/FormDoarAnimal/DoarAnimal";
import DoarAnimalFuncionario from "./Pages/Cadastros/FormDoarAnimal/DoarAnimalFuncionario"

//Catalogo produto e animal
import CatalogoProdutos from "./Pages/CatalogoProduto/CatalogoProduto";
import ProdutoDetalhes from "./Pages/ProdutoDetalhes/ProdutoDetalhes";
import CatalogoAdocao from "./Pages/CatalogoAnimais/CatalogoAdocao";

//PERFIL DE CLIENTE E PERFIL DE FUNCIONARIO

import PerfilCliente from "./Pages/Perfil/Cliente/PerfilCliente";

//Checkout e confirmação de pedido
import Checkout from "./Pages/Checkout/Checkout";
import OrderConfirmation from "./Pages/OrderConfirmation/OrderConfirmation";

//Caso esqueça senha
import RecuperarSenha from "./Pages/RecuperarSenha/RecuperarSenha";

//Registro e Login
import Login from "./Pages/Login/Login";
import Registro from "./Pages/Registro/Registro";
import EnderecoCadastro from "./Pages/EnderecoCadastro/EnderecoCadastro";

//Acesso negado
import AcessoNegado from "./Pages/AcessoNegado";

function RoutesApp() {
  const { isAuthenticated, isFuncionario, isCliente } = useAuth();

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={
        isAuthenticated ? (
          isFuncionario ? (
            <Navigate to="/home-funcionario" replace />
          ) : (
            <Home />
          )
        ) : (
          <Home />
        )
      } />
      <Route path="/registro" element={<Registro />} />
      <Route path="/login" element={
        isAuthenticated ? (
          isFuncionario ? (
            <Navigate to="/home-funcionario" replace />
          ) : (
            <Navigate to="/" replace />
          )
        ) : (
          <Login />
        )
      } />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/catalogo-produto" element={<CatalogoProdutos />} />
      <Route path="/produto/:id" element={<ProdutoDetalhes />} />
      <Route path="/catalogo-adocao" element={<CatalogoAdocao />} />

      {/* ROTA PROTEGIDA: APENAS CLIENTE */}
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

      

      {/* ROTA PROTEGIDA: APENAS FUNCIONÁRIO */}
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
        path="/formdoacao-funcionario"
        element={
          <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
            <DoarAnimalFuncionario />
          </ProtectedRoute>
        }
      />

      {/* ROTA PROTEGIDA: APENAS FUNCIONÁRIO */}
      <Route
        path="/formanimal"
        element={
          <ProtectedRoute allowedRoles={['FUNCIONARIO']}>
            <FormAnimal />
          </ProtectedRoute>
        }
      />

      {/* ROTA PROTEGIDA: APENAS CLIENTE */}
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

      {/* ROTA PROTEGIDA: QUALQUER USUÁRIO LOGADO (CLIENTE ou FUNCIONARIO) */}
      <Route
        path="/endereco-cadastro"
        element={
          <ProtectedRoute allowedRoles={['CLIENTE', 'FUNCIONARIO']}>
            <EnderecoCadastro />
          </ProtectedRoute>
        }
      />

      {/* PÁGINA DE ERRO DE ACESSO */}
      <Route path="/acesso-negado" element={<AcessoNegado />} />

      {/* REDIRECIONAMENTO PARA ROTAS INVÁLIDAS */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default RoutesApp;