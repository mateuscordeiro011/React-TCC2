import { useAuth } from "../../utils/useAuth";
import ClienteLayout from "./ClientLayouts";
import FuncionarioLayout from "./FuncionarioLayouts";
import PublicLayout from "./PublicLayouts";

export default function DynamicLayout({ children }) {
  const { isAuthenticated, isFuncionario, loading } = useAuth();

  // Enquanto carrega, pode mostrar um spinner ou layout público
  if (loading) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  if (isAuthenticated && isFuncionario) {
    return <FuncionarioLayout>{children}</FuncionarioLayout>;
  }

  if (isAuthenticated) {
    return <ClienteLayout>{children}</ClienteLayout>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}