import { Search, User, Store, Moon, Sun, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../thema.jsx";
import CartModal from "./modal_carrito.jsx";
import { UserDropdownMenu } from "../cliente/menu_usuario.jsx";
import { ModalInicio } from "../login/inicio.jsx";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../toast.js";

export default function Header() {
const [searchQuery, setSearchQuery] = useState("");
const { isDark, toggleDark } = useTheme();
const [openCart, setOpenCart] = useState(false);
const [openModal, setOpenModal] = useState(false);
const [loginForSelling, setLoginForSelling] = useState(false);



const role = localStorage.getItem("role");
const token = localStorage.getItem("token");

// 🟢 LEER INFORMACIÓN DEL USUARIO DE LOCALSTORAGE
const userName = localStorage.getItem("userName");
const userPhoto = localStorage.getItem("userPhoto");
const userId = localStorage.getItem("userId");

const safeUserPhoto =
    userPhoto &&
    userPhoto !== "null" &&
    userPhoto !== "undefined" &&
    userPhoto.trim() !== ""
        ? userPhoto
        : "https://i.pinimg.com/474x/d9/d8/8e/d9d88e3d1f74e2b8ced3df051cecb81d.jpg";

const navigate = useNavigate();

// 🟢 NUEVA FUNCIÓN: Maneja la búsqueda al presionar Enter y redirige
const handleSearchSubmit = (e) => {
    // Solo actuamos si se presiona la tecla Enter
    if (e.key === 'Enter' && searchQuery.trim()) {
        e.preventDefault(); // Previene cualquier comportamiento por defecto
        
        // Codificamos el query para que sea seguro en la URL
        const encodedQuery = encodeURIComponent(searchQuery.trim());
        
        // Navegamos a /productos con el parámetro de búsqueda
        navigate(`/explorar?query=${encodedQuery}`);
    }
};

// Función para el logout que limpia todos los ítems del usuario
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhoto");
    // Opcional: limpiar también los ítems de carrito o configuración si existen
    // localStorage.removeItem("cart"); 
    
    // Redirigir a la página principal y recargar para resetear el estado
    navigate("/");
    window.location.reload(); 
};

return (
    <header className={isDark ? "dark" : ""}>
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-22 items-center justify-between gap-4">
            
            {/*  LOGO (Colores originales) */}
            <Link to="/">
            <div className="flex items-center gap-2">
            
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
                <Store className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Sweet Home
            </span>
            
            </div>
            </Link>
            {/*  Buscador o Panel Admin */}
            <div className="mx-4 flex-1 w-full">
            {role === "Admin" ? (
                <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white">
                PANEL DE ADMINISTRADOR
                </h2>
            ) : (
                <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
                <input
                    type="text"
                    placeholder="Buscar productos, categorias ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    // 🟢 Agregamos el handler de la tecla Enter
                    onKeyDown={handleSearchSubmit} 
                    // Colores de focus originales
                    className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary dark:focus:ring-primary/20"
                />
                </div>
            )}
            </div>

            {/*  ACCIONES */}
            <div className="flex items-center gap-2">

            {/*  BOTONES ADMIN (Colores originales) */}
            {role === "Admin" && (
                <>
                <Link to="/usuarios">
                    <button className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
                    Usuarios
                    </button>
                </Link>

                <Link to="/categorias">
                    <button className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
                    Categorías
                    </button>
                </Link>

                <Link to="/productos">
                    <button className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
                    Productos
                    </button>
                </Link>

                <Link to="/pedidos">
                    <button className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
                    Pedidos
                    </button>
                </Link>
                </>
            )}

            {/*  CLIENTE: VENDER (Colores originales) */}
            {role === "Cliente" && (
                <button
                onClick={() => {
                    if (!token) {
                        setLoginForSelling(true);
                        setOpenModal(true);
                    } else {
                        navigate("/vender");
                    }
                }}
                className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                >
                    <Plus className="h-5 w-5" />
                    Vender
                </button>

            )}

            {/* ✅ CLIENTE: CARRITO (Colores de hover originales) */}
            {role !== "Admin" && (
                <>
                <button
                    onClick={() => setOpenCart(true)}
                    className="relative rounded-full p-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary"
                >
                    <ShoppingCart className="h-7 w-7" />
                </button>

                <CartModal isOpen={openCart} onClose={() => setOpenCart(false)} />
                </>
            )}
            

            {/*  NO LOGUEADO: BOTÓN LOGIN */}
            {!token && (
                <>
                <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 hover:shadow transition-all active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                    <User className="h-5 w-5" />
                    Iniciar Sesión
                </button>

                {/* Botón Vender para no logueado (Colores originales) */}
                <button
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        const role = localStorage.getItem("role");

                        if (!token) {
                            setOpenModal(true); // ✅ Abrimos el modal
                            return;
                        }

                        if (role === "Cliente") {
                            navigate("/vender");
                        }
                    }}
                    className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
                >
                    <Plus className="h-7 w-7" />
                    Vender
                </button>


                <ModalInicio
                    open={openModal}
                    onOpenChange={setOpenModal}
                    onLoginSuccess={(role) => {
                        setOpenModal(false);

                        if (role === "Cliente" && loginForSelling) {
                            navigate("/vender");
                        }
                        else{
                            // Usamos console.log() en lugar de alert() para evitar el bloqueo del iframe
                            showToast("Inicio de sesión exitoso");
                        }

                        // reset para evitar redirecciones futuras
                        setLoginForSelling(false);
                    }}
                />

                </>
            )}

            {/* LOGUEADO: MENÚ DE USUARIO */}
            {/* ✅ MENÚ SOLO PARA CLIENTE - AHORA CON DATOS DINÁMICOS */}
            {token && role === "Cliente" && (
                <UserDropdownMenu
                    // 🔧 Datos dinámicos
                    userName={userName || "Cliente"}
                    userAvatar={safeUserPhoto}

                    userId={userId} // El ID se pasa para enlaces de perfil
                    // 🔧 La función de logout usa la nueva función handleLogout
                    onLogout={handleLogout}
                />
            )}
            
            {/* LOGUEADO: BOTÓN CERRAR SESIÓN (Para Administrador y Cliente) */}
            {token && role !== "Cliente" && ( // Mostrar Cerrar Sesión si hay token, pero solo si NO es Cliente (el cliente lo tiene en el dropdown)
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-full border border-red-300 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 hover:shadow transition-all active:scale-95 dark:border-red-600 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-slate-700"
                >
                    Cerrar Sesión
                </button>
            )}


            {/*  Toggle Dark Mode */}
            <button
                onClick={toggleDark}
                className="rounded-full p-2.5 bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
            >
                {isDark ? (
                <Sun className="h-6 w-6 text-yellow-400" />
                ) : (
                <Moon className="h-6 w-6 text-gray-900" />
                )}
            </button>



            </div>
        </div>
        </div>
    </div>
    </header>
);
}