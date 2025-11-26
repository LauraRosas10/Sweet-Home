import { useState, useEffect } from "react"
import {
ShoppingCart,
Heart,
Share2,
Star,
MessageCircle,
Minus,
Plus,
} from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "../thema.jsx"
import axios from "axios"
import { showToast } from "../toast.js"


import { useCart } from "../../context/CartContext.jsx";

// Mapeo de IDs de categorías a nombres legibles (igual que en productos.jsx)
const categoryMap = {
"69003e7f7839b0d071d1ca8e": "Electrónica",
"69003e7f7839b0d071d1ca8f": "Accesorios",
}

export default function ProductDetail() {
const { id } = useParams()
const navigate = useNavigate()
const { isDark } = useTheme()

const prod= import.meta.env.VITE_API_PRODUCTOS;
const cat= import.meta.env.VITE_API_CATEGORIAS;
const user= import.meta.env.VITE_API_USUARIOS;


const [product, setProduct] = useState(null)
const [selectedImage, setSelectedImage] = useState(0)

const [isFavorite, setIsFavorite] = useState(false)
const {addToCart, updateQuantity, }= useCart();

  const { cartItems } = useCart();

useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" })
}, [id])


useEffect(() => {
    const fetchProduct = async () => {
    try {
        const response = await axios.get(`${prod}/${id}`)
        const p = response.data
        const normalizedProduct = {
        id: p._id,
        name: p.Nombre,
        description: p.Descripcion,
        price: p.Precio,
        image: p.Imagen,
        category: categoryMap[p.Categoria] || "Otros",
        stock: p.Stock,
        status: p.Estado,
        // ✨ AÑADIDO: Capturar el ID del creador/vendedor
        userId: p.UsuarioCreador, 
        }
        setProduct(normalizedProduct)
    } catch (error) {
        console.error("Error cargando producto:", error)
    }
    }
    fetchProduct()
}, [id])

useEffect(() => {
    setSelectedImage(0)

    setIsFavorite(false)
}, [product])

if (!product) {
    return (
    <h1 className="text-red-600 dark:text-red-400 font-bold text-xl">
        Producto no encontrado
    </h1>
    )
}


// ✨ NUEVA FUNCIÓN: Manejar el contacto por WhatsApp
const handleContactSeller = async () => {
    if (!product || !product.userId) {
        showToast("Error: No se encontró el ID del vendedor.");
        return;
    }

    try {
        // Obtener el token de autenticación (Asume que está en localStorage)
        const token = localStorage.getItem('token'); 
        
        if (!token) {
            showToast("Necesitas iniciar sesión para contactar al vendedor.");
            // Redirigir a la página de login si no hay token
            navigate('/explorar'); 
            return;
        }

        // Llama al endpoint de WhatsApp del backend
        const response = await axios.get(
            `${user}/${product.userId}/whatsapp`,
            {
                headers: {
                    Authorization: `Bearer ${token}` // Incluir el token para la verificación
                }
            }
        );

        const { enlace } = response.data;

        if (enlace) {
            // Abre el enlace de WhatsApp en una nueva pestaña
            window.open(enlace, '_blank');
        } else {
            showToast("No se pudo generar el enlace de WhatsApp.");
        }

    } catch (error) {
        console.error("Error al obtener el enlace de WhatsApp:", error);
        
        const status = error.response?.status;
        
        if (status === 404) {
            showToast("El vendedor no tiene un número de teléfono registrado.");
        } else if (status === 403) {
            showToast("Acceso denegado. Asegúrate de estar autenticado.");
        } else {
            showToast("Ocurrió un error al intentar contactar al vendedor.");
        }
    }
}


  // Obtener el item real del carrito
  const item = cartItems.find((i) => i.id === product.id);

  // Si no está en el carrito, cantidad = 0
  const quantity = item ? item.quantity : 0;

return (
    <div className={`${isDark ? "bg-slate-900" : "bg-white"} w-full min-h-screen transition-colors flex flex-col`}>
    <div className={`w-full container mx-auto px-4 py-8 max-w-7xl  transition-colors flex-1 ${isDark ? "bg-slate-900" : "bg-white"}`}>

        {/* Botón volver */}
        <button
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
        ← Volver a productos
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Galería */}
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl shadow bg-white dark:bg-slate-800 relative">
            <img
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-[450px] object-cover"
            />
            </div>

            {product.images?.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
                {product.images.map((img, i) => (
                <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`border-2 rounded-lg overflow-hidden transition-colors ${selectedImage === i ? "border-blue-500" : "border-transparent hover:border-gray-300 dark:hover:border-gray-500"}`}
                >
                    <img
                    src={img}
                    alt={`Vista ${i + 1}`}
                    className="w-full h-24 object-cover"
                    />
                </button>
                ))}
            </div>
            )}
        </div>

        {/* Información producto */}
        <div className="space-y-6 text-gray-900 dark:text-gray-100">
            <div>
            <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                
            </div>

<div>

{/* Stock solo */}
<div className="flex items-center gap-2 mb-3">
<span className="text-1xl font-bold text-gray-600 dark:text-gray-400">
    {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
</span>
</div>

</div>

            </div>

            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            €{product.price.toFixed(2)}
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {product.description}
            </p>

            {/* Cantidad */}
    <div className="flex items-center gap-3">
      <span className="font-medium">Cantidad:</span>

      <div className="flex items-center gap-2 text-foreground">
        <button
          onClick={() => updateQuantity(product.id, -1)}
          disabled={quantity <= 1 || product.stock === 0}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-base font-medium leading-normal transition-colors hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>

        <span className="w-6 text-center text-base font-medium leading-normal">
          {quantity}
        </span>

        <button
          onClick={() => updateQuantity(product.id, +1)}
          disabled={quantity >= product.stock || product.stock === 0}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-base font-medium leading-normal transition-colors hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>


            {/* Botón añadir al carrito */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
  onClick={() => addToCart(product)}
  className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-lg transition-colors
    ${item
      ? "bg-green-600 hover:bg-green-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white"
    }`}
  disabled={product.stock === 0}
>
  <ShoppingCart className="h-5 w-5" /> 
  {item ? "En el carrito ✔" : product.stock === 0 ? "Agotado" : "Añadir al carrito"}
</button>

            </div>

            {/* Botón contactar vendedor */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
                onClick={handleContactSeller} // ✨ Llamada a la nueva función
                className="flex-1 flex items-center justify-center gap-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-semibold py-3 rounded-lg transition-colors"
            >
                <MessageCircle className="h-5 w-5" /> Contactar por WhatsApp
            </button>
            </div>
        </div>
        </div>
    </div>
    </div>
)
}