import 'dotenv/config';
import express from 'express';  
import cors from 'cors';
import session from "express-session";
import passport from "./config/googleAuth.js";
import dbClient from './config/dbClient.js';
import fetch from "node-fetch";


// Rutas
import routersUsuario from './routers/usuariosR.js';
import routersCategoria from './routers/categoriasR.js';
import routerspedidos from './routers/pedidosR.js';
import routerProducto from './routers/productosR.js';
import googleAuthRoutes from "./routers/googleR.js";

const app = express();

// Body parsers correctos
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Sesión y passport
app.use(session({
    secret: process.env.JWT_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/api/usuarios', routersUsuario);
app.use('/api/productos', routerProducto);
app.use('/api/categorias', routersCategoria);
app.use('/api/pedidos', routerspedidos);
app.use("/auth", googleAuthRoutes);

// Manejo errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => console.log('Servidor activo en el puerto ' + PORT));

// Cerrar DB
process.on('SIGINT', async () =>{
    dbClient.cerrarConexion();
    process.exit(0);
});

setInterval(() => {
  fetch("https://sweet-home-46ww.onrender.com/api/productos");
}, 8 * 60 * 1000);