export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // Decodifica o payload do JWT (parte entre .)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // A role está no campo 'tipo' ou 'role'? Veja no seu payload.
    // No seu código, você usa: payload.tipo → então provavelmente é 'tipo'
    return payload.tipo; // ou payload.role, dependendo do que você enviou do back-end
  } catch (error) {
    console.error("Erro ao ler role do token:", error);
    return null;
  }
};