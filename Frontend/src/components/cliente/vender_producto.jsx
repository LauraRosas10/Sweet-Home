import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { showToast } from "../toast.js";

export default function ProductFormAdaptado({ editingId = null, productData = null }) {
  const userId = localStorage.getItem("userId");

  const [categorias, setCategorias] = useState([]);
  const cat= import.meta.env.VITE_API_CATEGORIAS;
  const prod= import.meta.env.VITE_API_PRODUCTOS;
  const user= import.meta.env.VITE_API_USUARIOS;

  const [formData, setFormData] = useState({
    Nombre: "",
    Descripcion: "",
    Categoria: "",
    Estado: "Disponible",
    Stock: "",
    Precio: "",
    Imagen: "",
    imagePreview: null,
    UsuarioCreador: userId || "",
  });

  // 🟦 PRE-CARGAR PRODUCTO SI ESTAMOS EDITANDO
  useEffect(() => {
    if (productData) {
      setFormData({
        Nombre: productData.Nombre,
        Descripcion: productData.Descripcion,
        Categoria: productData.Categoria,
        Estado: productData.Estado,
        Stock: productData.Stock,
        Precio: productData.Precio,
        Imagen: productData.Imagen || "",
        imagePreview: productData.Imagen || null,
        UsuarioCreador: productData.UsuarioCreador || userId,
      });
    }
  }, [productData]);

  // 🟦 CARGAR CATEGORÍAS
  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const res = await axios.get(`${cat}`);
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorías", err);
      }
    };
    loadCategorias();
  }, []);

  // 🟦 HANDLE INPUTS
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🟦 IMAGEN -> BASE64
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        Imagen: reader.result,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // 🟦 GUARDAR PRODUCTO (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      Nombre: formData.Nombre,
      Descripcion: formData.Descripcion,
      Categoria: formData.Categoria,
      Precio: Number(formData.Precio),
      Stock: Number(formData.Stock),
      Estado: formData.Estado,
      UsuarioCreador: formData.UsuarioCreador,
    };

    // Si hay una imagen nueva, agregarla
    if (formData.Imagen?.startsWith("data:")) {
      payload.Imagen = formData.Imagen;
    }

    try {
      if (editingId) {
        await axios.put(
          `${prod}/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        showToast("Producto actualizado");
      } else {
        if (!formData.Imagen) {
          showToast("Debes subir una imagen para crear el producto.");
          return;
        }

        await axios.post(
          `${prod}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        showToast("Producto creado");
        setFormData({
            Nombre: "",
            Descripcion: "",
            Categoria: "",
            Estado: "Disponible",
            Stock: "",
            Precio: "",
            Imagen: "",
            imagePreview: null,
            UsuarioCreador: userId, // NO lo borres
            });

      }
    } catch (err) {
      console.error(err);
      showToast("Error al guardar el producto");
    }
  };

  const handleGoBack = () => window.history.back();

return (
    <div className="w-full flex justify-center bg-slate-100 dark:bg-slate-900 py-6">

      {/* CARD CENTRAL */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-200 dark:border-slate-700">

        {/* Título */}
        <h2 className="text-xl font-bold text-center mb-4">
          {editingId ? "Editar Producto" : "Publicar Producto"}
        </h2>

        {/* FORMULARIO COMPACTO */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Imagen */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center">

            {formData.imagePreview ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={formData.imagePreview}
                  className="w-40 h-40 object-cover rounded-lg"
                />

                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                  Cambiar Imagen
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, Imagen: "", imagePreview: null }))}
                  className="text-red-500 text-sm"
                >
                  Quitar Imagen
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  +
                </div>
                <p className="text-sm font-semibold">Subir Imagen</p>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          {/* Nombre */}
          <div>
            <p className="text-sm font-semibold mb-1">Nombre</p>
            <input
              type="text"
              name="Nombre"
              value={formData.Nombre}
              onChange={handleInputChange}
              className="w-full h-10 rounded-lg px-3 border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          {/* Descripción */}
          <div>
            <p className="text-sm font-semibold mb-1">Descripción</p>
            <textarea
              name="Descripcion"
              value={formData.Descripcion}
              onChange={handleInputChange}
              className="w-full rounded-lg px-3 py-2 h-24 border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          {/* Categoría */}
          <div>
            <p className="text-sm font-semibold mb-1">Categoría</p>
            <select
              name="Categoria"
              value={formData.Categoria}
              onChange={handleInputChange}
              className="w-full h-10 rounded-lg px-3 border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            >
              <option value="">Seleccionar...</option>
              {categorias.map((c) => (
                <option key={c._id} value={c._id}>{c.Nombre}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <p className="text-sm font-semibold mb-1">Estado</p>
            <select
              name="Estado"
              value={formData.Estado}
              onChange={handleInputChange}
              className="w-full h-10 rounded-lg px-3 border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
            >
              <option value="Disponible">Disponible</option>
              <option value="Agotado">Agotado</option>
            </select>
          </div>

          {/* Stock + Precio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold mb-1">Stock</p>
              <input
                type="number"
                name="Stock"
                value={formData.Stock}
                onChange={handleInputChange}
                className="w-full h-10 rounded-lg px-3 border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Precio ($)</p>
              <input
                type="number"
                name="Precio"
                value={formData.Precio}
                onChange={handleInputChange}
                className="w-full h-10 rounded-lg px-3 border dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
          >
            {editingId ? "Actualizar" : "Publicar Producto"}
          </button>

        </form>
      </div>
    </div>
  );
}
