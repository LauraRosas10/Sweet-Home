import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ProductList from "./productos.jsx";
import { Plus, Image as ImageIcon } from "lucide-react";
import { showToast } from "../toast.js";

// Configuración de URLs
const API_URL = import.meta.env.VITE_API_PRODUCTOS;
const API_CATEGORIAS_URL = import.meta.env.VITE_API_CATEGORIAS;
const API_USUARIOS_URL = import.meta.env.VITE_API_USUARIOS;


/**
 * Obtiene la configuración de encabezados para la autenticación (Bearer Token).
 * @returns {object} Configuración de Axios con el encabezado de autorización.
 */
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export default function ProductManagement() {
  // --- ESTADOS PRINCIPALES ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [users, setUsers] = useState([]); 
  
  // --- ESTADOS UI/FORMULARIO ---
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  // ⭐ SE ELIMINÓ 'imageFile' porque estamos volviendo a usar Base64 en 'formData.image'


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    stock: "",
    status: "active",
    image: "", // Esta ahora almacena la URL o el Base64
    userId: "", 
  });


// --- FUNCIONES DE CARGA DE DATOS ---

  /**
   * Carga los productos y los normaliza, usando el mapa de categorías/usuarios.
   * @param {object} currentMap - El mapa de categorías para evitar problemas de sincronización inicial.
   */
  const fetchProducts = useCallback(async (currentMap) => {
    // Usa el mapa pasado o el estado.
    const map = currentMap || categoryMap; 

    try {
      const res = await axios.get(API_URL);

      const normalizedProducts = res.data.map((p) => {
        return {
            id: p._id,
            name: p.Nombre,
            description: p.Descripcion,
            // Extrae el ID de la categoría (si está populada) o usa el valor directo
            categoryId: p.Categoria?._id || p.Categoria, 
            price: p.Precio,
            stock: p.Stock,
            status: p.Estado === 'Disponible' ? 'active' : 'inactive',
            image: p.Imagen || "/placeholder.svg",
            // Extrae el ID del usuario (si está populado) o usa el valor directo
            userId: p.UsuarioCreador?._id || p.UsuarioCreador, 
            // Mapeamos el ID a su nombre para la VISUALIZACIÓN
            Categoria: map[p.Categoria?._id || p.Categoria] || "Otros", 
            Cat:p.Categoria?.Nombre || "Otros"
        };
      });
      setProducts(normalizedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error.response?.data?.error || error.message);
    }
  }, [categoryMap]); 


  // 🟢 EFECTO DE MONTAJE: Carga inicial de datos
  useEffect(() => {
    const fetchInitialData = async () => {
      let map = {};
      let activeCategories = [];
      let usersData = []; 
      
      // 1. CARGAR CATEGORÍAS
      try {
        const resCat = await axios.get(API_CATEGORIAS_URL);
        activeCategories = resCat.data.filter((c) => c.Activo);
        activeCategories.forEach((c) => (map[c._id] = c.Nombre));
      } catch (e) {
        console.error("Error cargando categorías:", e.response?.data?.error || e.message);
      }

      // 2. CARGAR USUARIOS
      try {
        const resUser = await axios.get(API_USUARIOS_URL, getAuthConfig());
        usersData = resUser.data; 
      } catch (e) {
        console.error("Error cargando usuarios:", e.response?.data?.error || e.message);
      }

      // 3. Establecer estados de datos
      setCategories(activeCategories);
      setCategoryMap(map);
      setUsers(usersData);

      // 4. Establecer valores por defecto para el formulario (Creación)
      const initialCategoryId = activeCategories[0]?._id || "";
      const initialUserId = usersData[0]?._id || "";

      setFormData(prev => {
        const catId = prev.categoryId || initialCategoryId;
        const usrId = prev.userId || initialUserId;
        return {
          ...prev,
          categoryId: catId,
          userId: usrId,
        };
      });

      // 5. CARGAR PRODUCTOS
      await fetchProducts(map);
    };

    fetchInitialData();

  }, [fetchProducts]); 


// --- MANEJO DE ESTADOS Y EVENTOS (CALLBACKS) ---

  // 🟢 Productos filtrados
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );


  // 🆕 Función genérica para manejar inputs y la subida de archivos (Base64)
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile" && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        // Usamos Base64 para la previsualización local y para el envío (como Base64)
        setFormData(prev => ({ ...prev, image: reader.result })); 
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  // 🔄 Lógica de Edición: Sincroniza el formulario con el producto a editar.
  const handleEdit = (product) => {
    // ... (Lógica de validación de IDs)
    const validCategoryId = categories.find(c => c._id === product.categoryId) 
      ? product.categoryId 
      : categories[0]?._id || "";
      
    const validUserId = users.find(u => u._id === product.userId)
      ? product.userId
      : users[0]?._id || "";
      
    setFormData({
      name: product.name,
      description: product.description,
      categoryId: validCategoryId,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.image, // URL existente
      userId: validUserId,
    });
    // La imagen previa muestra la URL existente o el Base64 (si se subió uno)
    setImagePreview(product.image);

    setEditingId(product.id);
    setShowForm(true);
  };


  // 🆕 Función para restablecer el formulario a sus valores por defecto
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: categories[0]?._id || "",
      price: "",
      stock: "",
      status: "active",
      image: "",
      userId: users[0]?._id || "",
    });
    setImagePreview("");
  };

  // ----------------------------------------------------
  // ✅ FUNCIONES CRUD
  // ----------------------------------------------------

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  // Desplaza la vista hacia arriba al abrir el formulario
  useEffect(() => {
    if (showForm) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
  }, [showForm]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, getAuthConfig());
      showToast("Producto eliminado correctamente.", 'success');
      setProducts(products.filter(p => p.id !== id));

    } catch (error) {
      console.error("Error al eliminar producto:", error.response?.data?.error || error.message);
      showToast(`Error al eliminar el producto: ${error.response?.data?.error || error.message}`, 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    const productToUpdate = products.find(p => p.id === id);
    if (!productToUpdate) return;

    // Mapeo de Frontend ('active'/'inactive') a Backend ('Disponible'/'Agotado')
    const currentBackendStatus = productToUpdate.status === "active" ? "Disponible" : "Agotado";
    const newBackendStatus = currentBackendStatus === "Disponible" ? "Agotado" : "Disponible";

    try {
      await axios.put(
        `${API_URL}/${id}`,
        { Estado: newBackendStatus },
        getAuthConfig()
      );

      // Actualizar estado en el frontend
      setProducts(
        products.map((p) => {
          if (p.id === id) {
             const newFrontendStatus = newBackendStatus === "Disponible" ? "active" : "inactive";
             return { ...p, status: newFrontendStatus };
          }
          return p;
        })
      );

      showToast(`Estado de producto cambiado a ${newBackendStatus}.`, 'success');

    } catch (error) {
      console.error("Error al cambiar estado:", error.response?.data?.error || error.message);
      showToast(`Error al cambiar el estado: ${error.response?.data?.error || error.message}`, 'error');
    }
  };


  // 🟢 Función para guardar (Crear/Actualizar)
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    
    // Muestra el Toast de "Subiendo..." para dar feedback mientras se envía el Base64
    showToast(`${editingId ? "Actualizando" : "Creando"} producto...`, 'loading'); 

    // Determinar si la imagen es un nuevo Base64 (subida de un archivo nuevo)
    const isNewBase64 = formData.image && formData.image.startsWith('data:image/');

    // Datos base a enviar
    const dataToSend = {
      Nombre: formData.name,
      Descripcion: formData.description,
      Categoria: formData.categoryId,
      Precio: Number.parseFloat(formData.price),
      Stock: Number.parseInt(formData.stock),
      Estado: formData.status === "active" ? "Disponible" : "Agotado",
    };

    // Solo enviamos UsuarioCreador si el campo está lleno
    if (formData.userId) {
        dataToSend.UsuarioCreador = formData.userId;
    }

    // Lógica de imagen: SOLO enviar la imagen si es nueva (Base64) o si estamos creando
    if (isNewBase64) {
        dataToSend.Imagen = formData.image;
    } else if (!editingId && !formData.image) {
        // Validación básica para creación
        showToast("Debes seleccionar una imagen para crear el producto.", 'warning');
        return;
    }


    try {
      if (editingId) {
        // Petición PUT (Actualizar)
        await axios.put(`${API_URL}/${editingId}`, dataToSend, getAuthConfig());
        showToast("Producto actualizado correctamente.", 'success');
      } else {
        // Petición POST (Crear)
        await axios.post(API_URL, dataToSend, getAuthConfig());
        showToast("Producto creado correctamente.", 'success');
      }

      await fetchProducts(); // Recargar productos para reflejar el cambio
      setShowForm(false);
      setEditingId(null);
      resetForm();

    } catch (error) {
      console.error("Error al guardar producto:", error.response?.data?.error || error.message);
      // Reemplaza el toast 'loading' con el toast 'error'
      showToast(`Error al guardar el producto: ${error.response?.data?.error || error.message}`, 'error');
    }
  }, [editingId, formData.name, formData.description, formData.categoryId, formData.price, formData.stock, formData.status, formData.image, formData.userId, fetchProducts]);


  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10 dark:text-white dark:bg-slate-900 dark:min-h-screen ">

        {/* Header con búsqueda y botón crear */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  Productos
                </h1>
                <p className="text-slate-600 dark:text-slate-400">Gestiona todos tus productos</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                resetForm();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Crear Producto
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-blue-200 dark:border-slate-700 shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">
              {editingId ? "Editar Producto" : "Nuevo Producto"}
          </h3>

          <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nombre */}
                <label className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre del Producto</span>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Camiseta Premium"
                    required
                    className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    />
                </label>

                {/* Categoría */}
                <label className="flex flex-col cursor-pointer">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categoría</span>
                    <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                    >
                    {categories.length === 0 && <option value="">Cargando categorías...</option>}
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.Nombre}
                      </option>
                    ))}
                    </select>
                </label>
              </div>

              {/* Usuario Creador - solo visible en modo Creación */}
              {
                !editingId && (
                  <label className="flex flex-col cursor-pointer">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Usuario Creador</span>
                      <select
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        required 
                        className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                      >
                        {users.length === 0 && <option value="">Cargando usuarios...</option>}
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.Nombre || user.Email} ({user.Email || "Sin email"})
                            </option>
                        ))}
                      </select>
                  </label>
                )
              }


              {/* Descripción */}
              <label className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descripción</span>
              <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe las características del producto..."
                  rows={3}
                  className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 resize-none"
              />
              </label>

              {/* IMAGEN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start p-4 border border-blue-200 dark:border-slate-700 rounded-lg bg-blue-50 dark:bg-slate-800">
                  <div className="md:col-span-2">
                      <label className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Imagen del Producto</span>
                          <input
                              type="file"
                              name="imageFile"
                              accept="image/*"
                              onChange={handleChange}
                              className="block w-full text-sm text-slate-500 dark:text-slate-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-100 file:text-blue-700
                                  hover:file:bg-blue-200
                                  dark:file:bg-slate-700 dark:file:text-blue-300 dark:hover:file:bg-slate-600"
                                  required={!editingId}
                          />
                          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                            {editingId ? "Sube un nuevo archivo para cambiar la imagen." : "Sube una imagen (JPEG/PNG)."}
                          </p>
                      </label>
                  </div>

                  {/* Previsualización */}
                  <div className="md:col-span-1 flex justify-center items-center">
                      <div className="w-32 h-32 rounded-lg overflow-hidden border border-dashed border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 flex justify-center items-center">
                          {imagePreview ? (
                              <img
                                  src={imagePreview}
                                  alt="Previsualización"
                                  className="w-full h-full object-cover"
                              />
                          ) : (
                              <ImageIcon className="w-8 h-8 text-blue-400 dark:text-slate-400" />
                          )}
                      </div>
                  </div>
              </div>

              {/* Precio, Stock, Estado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <label className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Precio</span>
                  <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
              </label>

              <label className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Stock</span>
                  <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  required
                  className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
              </label>

              <label className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estado</span>
                  <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  </select>
              </label>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 justify-end pt-4">
              <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
              >
                  Cancelar
              </button>
              <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 active:scale-95"
              >
                  {editingId ? "Actualizar" : "Crear"}
              </button>
              </div>
          </form>
          </div>
        )}

        {/* Lista de productos */}
        <ProductList
          products={filteredProducts}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}