import { useState } from "react";
import {  Star,ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../thema.jsx";

export const categories = ["Todos", "Electrónica", "Accesorios"];

export const products = [
{
    id: 1,
    name: "Laptop Pro",
    category: "Electrónica",
    price: 1299.0,
    rating: 4.8,
    reviews: 124,
    image: "https://lh3.googleusercontent.com/...",
    alt: "Laptop en un escritorio",
},
{
    id: 2,
    name: "Smartwatch 2",
    category: "Accesorios",
    price: 249.99,
    rating: 4.6,
    reviews: 89,
    image: "https://lh3.googleusercontent.com/...",
    alt: "Reloj inteligente con pantalla azul",
},
{
    id: 3,
    name: "Cámara DSLR 4K",
    category: "Electrónica",
    price: 899.0,
    rating: 4.9,
    reviews: 203,
    image: "https://lh3.googleusercontent.com/...",
    alt: "Cámara profesional con lente grande",
},
{
    id: 4,
    name: "Laptop Pro",
    category: "Electrónica",
    price: 1299.0,
    rating: 4.8,
    reviews: 124,
    image: "https://lh3.googleusercontent.com/...",
    alt: "Laptop en un escritorio",
},
{
    id: 5,
    name: "Smartwatch 2",
    category: "Accesorios",
    price: 249.99,
    rating: 4.6,
    reviews: 89,
    image: "https://lh3.googleusercontent.com/...",
    alt: "Reloj inteligente con pantalla azul",
},
{
    id: 6,
    name: "Cámara DSLR 4K",
    category: "Electrónica",
    price: 899.0,
    rating: 4.9,
    reviews: 203,
    image: "https://lh3.googleusercontent.com/...",
    alt: "Cámara profesional con lente grande",
},
];

export default function Productos() {
const navigate = useNavigate();
const [selectedCategory, setSelectedCategory] = useState("Todos");

const { isDark } = useTheme();
const filteredProducts =
    selectedCategory === "Todos"
    ? products
    : products.filter((p) => p.category === selectedCategory);

return (
    <section>
    <div className="bg-slate-50 py-16 dark:bg-slate-900 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 dark:bg-slate-900">

        {/* Filtros de categoría */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
            {categories.map((category) => (
            <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                selectedCategory === category
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-md scale-105"
                    : "bg-white text-slate-700 shadow-sm hover:shadow-md hover:scale-105 dark:bg-slate-800 dark:text-slate-300"
                }`}
            >
                {category}
            </button>
            ))}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
            <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-800"
                onClick={() => navigate(`/producto/${product.id}`)}
            >
                <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.alt}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
                </div>
                <div className="p-5">
                <div className="mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-foreground dark:text-white">
                    {product.rating}
                    </span>
                    <span className="text-sm text-muted-foreground dark:text-slate-400">
                    ({product.reviews})
                    </span>
                </div>

                <h3 className="text-lg font-bold text-foreground dark:text-white">
                    {product.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground dark:text-slate-400">
                    {product.category}
                </p>
                <p className="mt-3 text-2xl font-bold text-primary dark:text-primary">
                    ${product.price.toFixed(2)}
                </p>

                                  {/* ✅ Botón Añadir al carrito */}
                <button
                
                     onClick={(e) => {
                        e.stopPropagation(); // ❗ evita que vaya al detalle
                        addToCart(product);
                      }}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-2 font-semibold transition hover:bg-blue-700 active:scale-95"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Añadir al carrito
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    </div>
    </section>
);
}
