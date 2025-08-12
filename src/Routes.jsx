import { BrowserRouter, Routes, Route } from "react-router-dom"
import FormProduto from "./Pages/Cadastros/FormProduto/FormProduto";
import Registro from "./Pages/Registro/Registro"

function RoutesApp() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/Registro" element={<Registro/>}></Route>
                <Route path="/FormProduto" element={<FormProduto/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;