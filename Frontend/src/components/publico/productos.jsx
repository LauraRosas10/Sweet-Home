import { useState, useEffect } from "react";
import { ShoppingCart, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../thema.jsx";
import axios from "axios";
import { useCart } from "../../context/CartContext.jsx";

// URL de la API
const API_CATEGORIAS_URL = import.meta.env.VITE_API_CATEGORIAS;
const API_PRODUCTOS_URL = import.meta.env.VITE_API_PRODUCTOS;

const OTHER_CATEGORY_ID = "OTROS_ID_SIMBOLICO";

export default function Productos({ onCategoriesLoaded, search, filter }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("query") || "";

  const [normalizedProducts, setNormalizedProducts] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const { cartItems, addToCart } = useCart();

  //SOLO UN FETCH — Categorías y Productos en paralelo
  useEffect(() => {
  const fetchAll = async () => {
    try {
      const [resCategorias, resProductos] = await Promise.all([
        axios.get(API_CATEGORIAS_URL),
        axios.get(API_PRODUCTOS_URL),
      ]);

      // Procesar categorías
      const active = resCategorias.data.filter((c) => c.Activo);

      const map = {};
      active.forEach((c) => (map[c._id] = c.Nombre));
      setCategoryMap(map);

      const categoryNames = active.map((c) => c.Nombre);
      categoryNames.push("Otros");

      if (onCategoriesLoaded) {
        onCategoriesLoaded(categoryNames);
      }

      // Procesar productos
      const availableAndVisible = resProductos.data.filter(
        (p) => p.Estado === "Disponible" && p.Visible === true
      );

      const normalized = availableAndVisible.map((p) => {
        let catId = null;
        let catName = "Otros";

        if (p.Categoria) {
          if (typeof p.Categoria === "object" && p.Categoria !== null) {
            catId = p.Categoria._id ? p.Categoria._id.toString() : null;
            catName = p.Categoria.Nombre || "Otros";
          } else if (typeof p.Categoria === "string") {
            catId = p.Categoria;
            catName = map[catId] || "Otros";
          }
        }

        return {
          id: p._id,
          name: p.Nombre,
          price: p.Precio,
          image: p.Imagen,
          categoryId: catId || OTHER_CATEGORY_ID,
          categoryName: catName,
          stock: p.Stock,
          Categoria: p.Categoria,
        };
      });

      setNormalizedProducts(normalized);
    } catch (e) {
      console.error("Error cargando datos:", e);
    }
  };

  fetchAll();
}, []); // <--- SOLO UNA VEZ


  // 🔎 FILTRADO FINAL
  const filteredProducts = normalizedProducts.filter((p) => {
    if (p.stock <= 0) return false;

    if (urlQuery) {
      const q = urlQuery.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.categoryName.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

    if (filter && filter.length > 0) {
      const lowerFilters = filter.map((f) => f.toLowerCase());
      if (!lowerFilters.includes(p.categoryName.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <section>
      <div className="bg-slate-50 pt-3 pb-16 dark:bg-slate-900 sm:pt-3 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Banner de búsqueda */}
          {urlQuery && (
            <div className="mb-6 flex items-center gap-2 rounded-xl bg-blue-100 p-4 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-lg">
              <Search className="h-5 w-5" />
              <p className="font-semibold text-lg">
                Resultados para: <span className="font-bold">"{urlQuery}"</span>
                <button
                  onClick={() => navigate("/explorar")}
                  className="ml-4 text-sm underline opacity-80 hover:opacity-100 transition-opacity font-medium"
                >
                  (Limpiar búsqueda)
                </button>
              </p>
            </div>
          )}

          {/* GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => {
              const isInCart =
                cartItems.some((item) => item.id === product.id) || false;

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/producto/${product.id}`)}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={
                        product.image ||
                        "https://placehold.co/400x400/94A3B8/ffffff?text=Producto"
                      }
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/400x400/94A3B8/ffffff?text=Producto";
                      }}
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {product.Categoria?.Nombre || product.categoryName}
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-blue-600 dark:text-blue-500">
                      ${product.price?.toFixed(2) ?? "0.00"}
                    </p>

                    <div className="flex items-center gap-2 mt-2 mb-3">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {product.stock > 0
                          ? `${product.stock} en stock`
                          : "Agotado"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      className={`mt-4 w-full flex items-center justify-center gap-2 rounded-xl py-2 font-semibold transition active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed
                        ${
                          isInCart
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }
                      `}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock === 0
                        ? "Agotado"
                        : isInCart
                        ? "En el carrito ✔️"
                        : "Añadir al carrito"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-8 shadow-inner">
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {urlQuery
                  ? `No se encontraron resultados para "${urlQuery}".`
                  : "Cargando productos..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
