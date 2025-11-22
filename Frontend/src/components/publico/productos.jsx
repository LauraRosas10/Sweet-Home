import { useState, useEffect } from "react";
import { ShoppingCart, Search } from "lucide-react"; 
import { useNavigate, useSearchParams } from "react-router-dom"; 
import { useTheme } from "../thema.jsx"; 
import axios from "axios";
import { useCart } from "../../context/CartContext.jsx"; 

// URL de la API (Ajusta si es necesario)
const API_CATEGORIAS_URL = "http://localhost:5100/api/categorias";
const API_PRODUCTOS_URL = "http://localhost:5100/api/productos";

const OTHER_CATEGORY_ID = "OTROS_ID_SIMBOLICO"; 

// Aceptamos las props 'onCategoriesLoaded', 'search' y 'filter'
export default function Productos({ onCategoriesLoaded, search, filter }) {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // Lectura del query de búsqueda desde la URL
    const [searchParams] = useSearchParams(); 
    const urlQuery = searchParams.get('query') || ''; 
    
    const [normalizedProducts, setNormalizedProducts] = useState([]);
    
    // categoryMap: { 'ID_Mongo': 'Nombre_Categoria' }
    const [categoryMap, setCategoryMap] = useState({}); 
    const { addToCart } = useCart();


    // --- SECCIÓN DE FETCHING DE DATOS ---

    // ## 1. Traer categorías y mapear
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(API_CATEGORIAS_URL);
                const active = res.data.filter((c) => c.Activo);

                const map = {};
                active.forEach((c) => (map[c._id] = c.Nombre)); // Mapeamos ID -> Nombre
                setCategoryMap(map);
                
                // Enviamos los NOMBRES de categoría al componente padre (Sidebar)
                const categoryNames = active.map(c => c.Nombre);
                categoryNames.push("Otros"); 

                if (onCategoriesLoaded) {
                    onCategoriesLoaded(categoryNames);
                }

            } catch (e) {
                console.error("Error cargando categorías:", e);
            }
        };
        fetchCategories();
    }, [onCategoriesLoaded]);


    // ## 2 y 3. Traer productos y Normalizar
    useEffect(() => {
        // No necesitamos categoryMap aquí si los productos vienen populados, 
        // pero lo dejamos para capturar "Otros" si es necesario.
        const fetchProducts = async () => {
            try {
                const res = await axios.get(API_PRODUCTOS_URL);
                
                const availableAndVisible = res.data.filter(p => 
                    p.Estado === 'Disponible' && p.Visible === true
                );
                
                // Normalización de datos
                const normalized = availableAndVisible.map((p) => {
            
                    let catId = null;
                    let catName = "Otros"; // 💡 Valor por defecto en "Otros"
                    
                    // 🟢 LÓGICA AJUSTADA
                    if (p.Categoria) {
                        if (typeof p.Categoria === 'object' && p.Categoria !== null) {
                            // Caso 1: Categoría populada
                            // Extrae el ID si existe para propósitos internos y el Nombre para el filtro.
                            catId = p.Categoria._id ? p.Categoria._id.toString() : null;
                            catName = p.Categoria.Nombre || "Otros"; // Usa el nombre populado
                        } 
                        else if (typeof p.Categoria === 'string' && p.Categoria.length > 0) {
                            // Caso 2: Categoría solo el string del ID
                            catId = p.Categoria;
                            // Búsqueda del nombre en el mapa auxiliar (solo si viene como ID)
                            catName = categoryMap[catId] || "Otros"; 
                        }
                    }
                    // 🟢 FIN DE LA LÓGICA AJUSTADA
                
                    const finalCategoryId = catId || OTHER_CATEGORY_ID;
                    
                    return {
                        id: p._id,
                        name: p.Nombre,
                        price: p.Precio,
                        image: p.Imagen,
                        categoryId: finalCategoryId,
                        // 💡 Este campo es el que usaremos para el filtro del Sidebar.
                        categoryName: catName, 
                        stock: p.Stock,
                        // Mantenemos el objeto Categoria original para el display.
                        Categoria: p.Categoria
                    };
                });

                setNormalizedProducts(normalized);

            } catch (e) {
                console.error("Error cargando productos:", e);
            }
        };
        
        // Si no hemos cargado las categorías aún, esperamos a que se carguen 
        // si la data viene despopulada (Caso 2). 
        // Si viene populada (Caso 1), podemos seguir. 
        // Ejecutamos siempre para manejar ambos casos de forma segura.
        fetchProducts();
        
    }, [categoryMap]); 


    // 🟢 LÓGICA DE FILTRADO FINAL (Sidebar + Búsqueda URL)
    const filteredProducts = normalizedProducts.filter((p) => {
        
        // 1. Filtramos productos sin stock
        if (p.stock <= 0) {
            return false;
        }

        // 2. FILTRADO POR BÚSQUEDA (urlQuery)
        if (urlQuery) {
            const queryLower = urlQuery.toLowerCase();
            const matchesName = p.name.toLowerCase().includes(queryLower);
            const matchesCategory = p.categoryName.toLowerCase().includes(queryLower);
            
            if (!matchesName && !matchesCategory) {
                return false;
            }
        }
        
        // 3. FILTRADO PRINCIPAL POR SIDEBAR (prop 'filter' - NOMBRES de categorías)
        if (filter && filter.length > 0) {
            
            // 💡 Estandarizamos a minúsculas para la comparación insensible
            const lowerCaseFilters = filter.map(f => f.toLowerCase());
            // Usamos el campo categoryName que normalizamos arriba
            const lowerCaseProductCategory = p.categoryName.toLowerCase(); 
            
            // Si el producto NO está en los filtros seleccionados, se excluye.
            if (!lowerCaseFilters.includes(lowerCaseProductCategory)) {
                return false;
            }
        }
        
        // Si el producto pasó todos los filtros, lo incluimos.
        return true;
    });

    // Función que se dispara al hacer click en el carrito de la tarjeta 
    const handleAddToCart = (product) => {
        addToCart(product, 1);
    };

    return (
        <section>
        <div className="bg-slate-50 pt-3 pb-16 dark:bg-slate-900 sm:pt-3 sm:pb-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                

                {/* BANNER DE BÚSQUEDA ACTIVA */}
                {urlQuery && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl bg-blue-100 p-4 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-lg">
                        <Search className="h-5 w-5" />
                        <p className="font-semibold text-lg">
                            Resultados para: <span className="font-bold">"{urlQuery}"</span>
                            <button 
                                onClick={() => navigate('/explorar')}
                                className="ml-4 text-sm underline opacity-80 hover:opacity-100 transition-opacity font-medium"
                            >
                                (Limpiar búsqueda)
                            </button>
                        </p>
                    </div>
                )}


                {/* Grid de productos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/producto/${product.id}`)}
                        className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                        <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                        <img
                            src={product.image || "https://placehold.co/400x400/94A3B8/ffffff?text=Producto"}
                            alt={product.name}
                            width={400}
                            height={400}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/400x400/94A3B8/ffffff?text=Producto";
                            }}
                        />
                        </div>
                        <div className="p-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {product.name}
                        </h3>
                        <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                            {/* 💡 Usamos la propiedad que indicaste: product.Categoria?.Nombre */}
                            {product.Categoria?.Nombre || product.categoryName} 
                        </p>
                        <p className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-500">
                            ${product.price != null ? product.price.toFixed(2) : "0.00"}
                        </p>

                        <div className="flex items-center gap-2 mt-2 mb-3">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
                            </span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2 font-semibold transition hover:bg-blue-700 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
                        </button>
                        </div>
                    </div>
                    ))}
                </div>

                {/* Mensaje dinámico si no hay productos filtrados */}
                {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-8 shadow-inner">
                        <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                            {urlQuery 
                                ? `No se encontraron resultados para "${urlQuery}".`
                                : "No hay productos que coincidan con los filtros seleccionados."
                            }
                        </p>
                    </div>
                )}
                
            </div>
        </div>
        </section>
    );
}