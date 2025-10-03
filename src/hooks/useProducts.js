// src/hooks/useProducts.js
import { useState, useEffect } from 'react';

export const useProducts = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api-salsi/produtos");
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();

      const formattedProducts = data.map(p => ({
        id_produto: p.Id_produto,
        id: p.Id_produto, // para compatibilidade
        nome: p.Nome,
        descricao: p.Descricao,
        preco: p.Preco,
        estoque: p.Estoque,
        foto: p.Foto ? `data:image/jpeg;base64,${p.Foto}` : null,
        categoria: "Petshop", // ou adicione uma coluna Categoria na tabela se precisar
        rating: 4.5 // opcional: pode vir de outra tabela de avaliações
      }));

      
      const produtosArray = Array.isArray(data) ? data : [];
      setItems(produtosArray);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setError("Falha ao carregar produtos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { items, loading, error, refreshProducts: loadProducts };
};

export const useProductDetails = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductDetails = async () => {
    try {
      if (!id) {
        setError("ID do produto não fornecido.");
        return;
      }
      
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api-salsi/produtos/${id}`);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error("Erro ao carregar detalhes do produto:", err);
      setError("Falha ao carregar detalhes do produto. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  return { product, loading, error, refreshProduct: loadProductDetails };
};