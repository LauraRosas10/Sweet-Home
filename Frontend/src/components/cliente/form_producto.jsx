import { useState, useEffect } from "react";
import ProductList from "./productos.jsx";
import { Package, Plus } from "lucide-react";
import axios from "axios";
import { Image as ImageIcon } from "lucide-react";
import { showToast } from "../toast.js";


export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const cat= import.meta.env.VITE_API_CATEGORIAS;
  const prod= import.meta.env.VITE_API_PRODUCTOS;
  const user= import.meta.env.VITE_API_USUARIOS;

  // 💠 Nueva: preview de imagen
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    Nombre: "",
    Descripcion: "",
    Categoria: "",
    Precio: "",
    Stock: "",
    Estado: "Disponible",
    Imagen: "",
    UsuarioCreador:""
  });

  const filteredProducts = products.filter(
    (p) =>
      typeof p?.Nombre === "string" &&
      p.Nombre.toLowerCase().includes(search.toLowerCase())
  );

  // 📸 MANEJO DE IMAGEN
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, Imagen: reader.result }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
  if (showForm) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}, [showForm]);


  // ✏️ EDITAR PRODUCTO
  const handleEdit = (product) => {
    setFormData({
      Nombre: product.Nombre,
      Descripcion: product.Descripcion,
      Categoria: product.Categoria,
      Precio: product.Precio,
      Stock: product.Stock,
      Estado: product.Estado,
      Imagen: product.Imagen || "",
      UsuarioCreador: product.UsuarioCreador|| userId

  

    });

    console.log(product.UsuarioCreador)
    setImagePreview(product.Imagen || null);
    setEditingId(product._id);
    setShowForm(true);
  };

  const userId = localStorage.getItem("userId");

  // 💾 GUARDAR PRODUCTO
 const handleSave = async (e) => {
  e.preventDefault();

  const isNewBase64 = formData.Imagen?.startsWith("data:");

  const dataSend = {
    Nombre: formData.Nombre,
    Descripcion: formData.Descripcion,
    Categoria: formData.Categoria,
    Precio: Number(formData.Precio),
    Stock: Number(formData.Stock),
    Estado: formData.Estado,
    Imagen: formData.Imagen,
    UsuarioCreador: formData.UsuarioCreador,
  };

  try {
    // --- CREAR PRODUCTO ---
    if (!editingId) {
      if (!dataSend.Imagen || !isNewBase64) {
        showToast("Debes seleccionar una imagen para crear el producto.");
        return;
      }
    
      await axios.post(
        `${prod}`,
        dataSend,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      showToast("Producto creado correctamente ");

    }

    // --- EDITAR PRODUCTO ---
    else {

        console.log(userId)
        const isBase64 = formData.Imagen?.startsWith("data:");
  const isEmpty = formData.Imagen === "" || formData.Imagen === null;

  if (isBase64) {
    // Imagen NUEVA -> enviar base64
    dataSend.Imagen = formData.Imagen;
  } 
  else if (isEmpty) {
    // Usuario presionó "Quitar imagen"
    dataSend.Imagen = "";
  } 
  else {
    // Imagen existente -> NO tocarla
    delete dataSend.Imagen;
  }


      await axios.put(
        `${prod}/${editingId}`,
        dataSend,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      showToast("Producto actualizado correctamente ");
    }

    await fetchProducts();
    handleCancel();

  } catch (err) {
    console.error("Error guardando:", err);
  
    showToast("Todos los campos son obligatorios" );
  }
};

  // 🔄 CAMBIAR ESTADO
  const handleToggleStatus = async (id) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    const newEstado = product.Estado === "Disponible" ? "Agotado" : "Disponible";

    try {
      await axios.put(
        `${prod}/${id}`,
        { Estado: newEstado },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setProducts(
        products.map((p) =>
          p._id === id ? { ...p, Estado: newEstado } : p
        )
      );

      showToast(`Estado actualizado a: ${newEstado}`);

    } catch (err) {
      console.error(err);
      showToast("❌ Error al cambiar estado");
    }
  };

  // RESET FORMULARIO
  const resetForm = () => {
    setFormData({
      Nombre: "",
      Descripcion: "",
      Categoria: "",
      Precio: "",
      Stock: "",
      Estado: "Disponible",
      Imagen: "",
    });
    setImagePreview(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // CARGAR PRODUCTOS
  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${prod}/mis/misproductos`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando productos:", err);
      showToast("❌ Error al cargar productos");
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // CARGAR CATEGORÍAS
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axios.get(`${cat}`);
        setCategorias(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategorias();
  }, []);

  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 dark:text-white">

        {/* HEADER */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Productos</h1>

            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                resetForm();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
              Crear Producto
            </button>
          </div>

          {/* BUSCADOR */}
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full px-4 py-3 rounded-lg
              bg-blue-50 text-slate-900 border border-blue-200
              dark:bg-slate-800 dark:text-white dark:border-slate-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          />
        </div>

        {/* FORMULARIO */}
        {showForm && (
          <div className="mb-8 p-6 bg-[#F0F6FF] dark:bg-slate-800 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-6">{editingId ? "Editar Producto" : "Nuevo Producto"}</h3>

            <form onSubmit={handleSave} className="space-y-5">




              {/* CAMPOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <label className="flex flex-col">
                  <span className="mb-1">Nombre</span>
                  <input
                    type="text"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#F0F6FF] dark:bg-slate-800 border"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="mb-1">Categoría</span>
                  <select
                    value={formData.Categoria}
                    onChange={(e) => setFormData({ ...formData, Categoria: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#F0F6FF] dark:bg-slate-800 border"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map((c) => (
                      <option key={c._id} value={c._id}>{c.Nombre}</option>
                    ))}
                  </select>
                </label>

              </div>

              {/* DESCRIPCIÓN */}
              <label className="flex flex-col">
                <span className="mb-1">Descripción</span>
                <textarea
                  value={formData.Descripcion}
                  onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-[#F0F6FF] dark:bg-slate-800 border"
                />
              </label>

              
              {/* IMAGEN */}
{/* IMAGEN DEL PRODUCTO */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start p-6 rounded-xl 
  border border-blue-200 bg-blue-50/60 dark:bg-slate-800 dark:border-slate-700">

  {/* Lado izquierdo: botón + texto */}
  <div className="md:col-span-2 flex flex-col gap-2">

    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      Imagen del Producto
    </span>

    {/* Botón subir archivo */}
    <label
      className="
        inline-block px-4 py-2 rounded-lg cursor-pointer text-sm font-medium w-max
        bg-blue-600 text-white hover:bg-blue-700
        dark:bg-blue-500 dark:hover:bg-blue-400
      "
    >
      Seleccionar archivo
      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="hidden"
      />
    </label>

    <p className="text-xs text-slate-600 dark:text-slate-400">
      Sube una imagen (JPEG/PNG).
    </p>

    {/* Botón quitar */}
    {imagePreview && (
      <button
        type="button"
        onClick={() => {
          setImagePreview(null);
          setFormData((p) => ({ ...p, Imagen: "" }));
        }}
        className="text-sm text-red-500 hover:text-red-600 w-max 
          dark:text-red-400 dark:hover:text-red-300"
      >
        Quitar imagen
      </button>
    )}
  </div>

  {/* Lado derecho: preview */}
  <div className="md:col-span-1 flex justify-center items-center">
    <div
      className="
        w-32 h-32 rounded-xl border border-dashed border-blue-300 
        dark:border-slate-600 bg-white dark:bg-slate-700
        flex items-center justify-center overflow-hidden
      "
    >
      {imagePreview ? (
        <img
          src={imagePreview}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <ImageIcon className="w-8 h-8 text-blue-400 dark:text-slate-400" />
      )}
    </div>
  </div>
</div>

              {/* PRECIO / STOCK / ESTADO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <label className="flex flex-col">
                  <span className="mb-1">Precio</span>
                  <input
                    type="number"
                    value={formData.Precio}
                    onChange={(e) => setFormData({ ...formData, Precio: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#F0F6FF] dark:bg-slate-800 border"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="mb-1">Stock</span>
                  <input
                    type="number"
                    value={formData.Stock}
                    onChange={(e) => setFormData({ ...formData, Stock: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#F0F6FF] dark:bg-slate-800 border"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="mb-1">Estado</span>
                  <select
                    value={formData.Estado}
                    onChange={(e) => setFormData({ ...formData, Estado: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-[#F0F6FF] dark:bg-slate-800 border"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Agotado">Agotado</option>
                  </select>
                </label>

              </div>

              {/* BOTONES */}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={handleCancel} className="text-slate-700 dark:text-slate-300">
                  Cancelar
                </button>

                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg">
                  {editingId ? "Actualizar" : "Crear"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* LISTA */}
        <ProductList
          products={filteredProducts}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  );
}
