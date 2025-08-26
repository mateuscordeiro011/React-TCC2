import { BrowserRouter, Routes, Route } from "react-router-dom"
import FormProduto from "./Pages/Cadastros/FormProduto/FormProduto";
import Registro from "./Pages/Registro/Registro"
import Home from "./Pages/Home/Home";
import FormAnimal from "./Pages/Cadastros/FormAnimal/FormAnimal";
import DoarAnimal from "./Pages/Cadastros/FormDoarAnimal/DoarAnimal"

function RoutesApp() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/Registro" element={<Registro/>}></Route>
                <Route path="/FormProduto" element={<FormProduto/>}></Route>
                <Route path="/FormAnimal" element={<FormAnimal/>}></Route>
                <Route path="/FormDoacao" element={<DoarAnimal/>}></Route>
                <Route path="/" element={<Home/>}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesApp;