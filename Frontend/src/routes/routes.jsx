// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "../components/layout"; // Importamos el Layout

//  Páginas públicas
import Home from "../components/publico/home";
import  ProductDetail from "../components/publico/detalleProducto";



const AppRoutes = () => {
    return (
        <Routes>
        {/* Agrupamos las rutas que deben tener navbar y footer */}
        <Route element={<Layout />}>
            {/*  RUTAS PÚBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/producto/:id" element={<ProductDetail />} />

            {/* Ruta no encontrada */}
            <Route path="*" element={<h1>Página no encontrada</h1>} />
        </Route>
        </Routes>
    );
};

export default AppRoutes;
