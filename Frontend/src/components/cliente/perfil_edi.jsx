import { useEffect, useState } from "react";
// Importamos la instancia de Axios configurada desde api.js
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { showToast } from "../toast.js";

// Si el email se guarda en localStorage durante el login, lo inicializamos aquí.
const initialEmail =
  typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Default" // Valor por defecto
  );
  const [loading, setLoading] = useState(true); // Se inicia en true para mostrar la carga
  const [errorState, setErrorState] = useState(null); // Nuevo estado para errores críticos (ej. autenticación)

  const [formData, setFormData] = useState({
    fullName: "",
    email: initialEmail,
    phone: "",
    address: "",
  });

  // Manejador genérico para inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ======================================================
  // CARGAR USUARIO
  // ======================================================
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    // **NUEVO: Verificar que el token de autenticación exista**
    const storedToken = localStorage.getItem("token");

    // Manejo de error: Si falta ID o Token en localStorage, se aborta la carga.
    if (!storedId || !storedToken) {
      console.error("🔴 Falta userId o token en localStorage. Abortando carga de perfil.");
      setLoading(false); 
      
      let errorMessage = "Fallo de Autenticación. Por favor, asegúrate de haber iniciado sesión.";
      if (!storedId) {
          errorMessage = "Error: ID de usuario no encontrado en la sesión. Asegúrate de iniciar sesión.";
      } else if (!storedToken) {
           errorMessage = "Error 403 probable: Token de autenticación no encontrado. Tu sesión puede haber expirado.";
      }
      
      setErrorState(errorMessage);
      return; // Detiene la ejecución de useEffect
    }

    // 1. Establece el estado de userId.
    setUserId(storedId); 

    // Definimos la función de carga
    const cargarUsuario = async (id) => {
      try {
        // 2. Usamos 'id' (que es storedId) para asegurar el valor.
        const res = await api.get(`/usuarios/${id}`); 
        
        setFormData({
          fullName: res.data.Nombre || "",
          email: res.data.Email || initialEmail,
          phone: res.data.Telefono || "",
          address: res.data.Direccion || "",
        });
        setProfileImage(res.data.Foto || "https://api.dicebear.com/7.x/avataaars/svg?seed=Default");

      } catch (error) {
        console.error("❌ Error cargando usuario:", error);
        
        let message = "Error desconocido al cargar el perfil.";

        if (error.code === 'ERR_NETWORK') {
          message = "Error de conexión. Asegúrate de que el servidor backend  esté encendido.";
        } else if (error.response) {
            if (error.response.status === 403) {
                // Maneja el error 403 (Forbidden) reportado
                message = "Acceso Denegado (403). Tu token de sesión es inválido o ha expirado. Por favor, verifica el token o vuelve a iniciar sesión.";
            } else {
                 message = `Error al cargar (Código ${error.response.status}). Revisa la consola para más detalles.`;
            }
        }
        
        // Muestra el error en la interfaz de usuario
        setErrorState(message);

      } finally {
        // 3. Quita el estado de carga al finalizar.
        setLoading(false); 
      }
    };

    // Llamamos a la función
    cargarUsuario(storedId);
  }, []);

  // ======================================================
  // GUARDAR CAMBIOS
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      // Reemplazo de alert con una lógica de manejo de errores más elegante
      setErrorState("No se pudo obtener tu ID de usuario para guardar los cambios. Intenta recargar la página.");
      return;
    }

    const body = {
      Nombre: formData.fullName,
      Telefono: formData.phone,
      Direccion: formData.address,
      Foto: profileImage,
    };

    try {
      const res = await api.put(`/usuarios/${userId}`, body);
      console.log("✅ Actualizado:", res.data);
      // **IMPORTANTE: En una aplicación real, no usar 'alert()'. Dejaré este como un mensaje temporal.**
      showToast("Datos actualizados correctamente!");
    } catch (err) {
      console.error("❌ Error al actualizar:", err);
      // **IMPORTANTE: En una aplicación real, no usar 'alert()'. Dejaré este como un mensaje temporal.**
      showToast("No se pudo actualizar el perfil. Revisa la conexión y el token.");
    }
  };

  // ======================================================
  // CAMBIAR FOTO
  // ======================================================
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = () => {
    setProfileImage(
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Default"
    );
  };

  // ======================================================
  // UI - Renderizado Condicional
  // ======================================================
  
  // Renderizado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#e3f5ff]">
        <svg className="animate-spin h-8 w-8 text-[#1e40af] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-semibold text-[#1e40af]">Cargando perfil...</p>
      </div>
    );
  }
  
  // Renderizado de error
  if (errorState) {
      return (
          <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 dark:bg-gray-900 px-4">
              <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center">
                  <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h1 className="mt-4 text-2xl font-bold text-red-700 dark:text-red-400">Error Crítico</h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{errorState}</p>
                  <button 
                      onClick={() => window.location.reload()}
                      className="mt-6 w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
                  >
                      Recargar Página
                  </button>
              </div>
          </div>
      );
  }


  // Renderizado principal (solo si loading es false y no hay error)
  return (
    <div className="min-h-screen bg-[#e3f5ff] dark:from-gray-900 dark:via-blue-950 dark:to-cyan-950">
      <main className="flex justify-center py-8 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col max-w-4xl w-full gap-8">

          {/* FOTO + CABECERA */}
          <div className="bg-gradient-to-br from-[#90d5ff] to-[#a8dfff] rounded-2xl p-8 sm:p-12 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-6">

              <div className="relative">
                {/* Usamos un fallback si la imagen falla por si acaso */}
                <img
                  src={profileImage}
                  alt="Foto de Perfil"
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Default";
                  }}
                />
                
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
                  <svg className="w-6 h-6 text-[#90d5ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-black">Mi Perfil</h1>
              <p className="text-black text-lg">Gestiona tu información personal</p>

              <div className="flex flex-wrap gap-3 justify-center">
                <input type="file" id="photoInput" accept="image/*" onChange={handlePhotoChange} className="hidden" />

                <button
                  type="button"
                  onClick={() => document.getElementById("photoInput").click()}
                  className="bg-white/90 hover:bg-white text-black font-semibold px-5 py-2 rounded-lg shadow transition duration-150 ease-in-out transform hover:scale-[1.02]"
                >
                  Cambiar Foto
                </button>

                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  className="text-black border-2 border-black/50 hover:bg-white/10 px-5 py-2 rounded-lg transition duration-150 ease-in-out"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Información Personal</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <p className="text-black dark:text-gray-300 font-medium">Nombre Completo</p>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full h-12 pl-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#90d5ff] focus:border-[#90d5ff] transition"
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-black dark:text-gray-300 font-medium">Correo Electrónico</p>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full h-12 pl-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-black dark:text-gray-300 font-medium">Número de Teléfono</p>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-12 pl-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#90d5ff] focus:border-[#90d5ff] transition"
                      placeholder="Ingresa tu número de teléfono"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-black dark:text-gray-300 font-medium">Dirección</p>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full h-12 pl-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#90d5ff] focus:border-[#90d5ff] transition"
                      placeholder="Ingresa tu dirección"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full sm:w-auto h-12 px-8 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
            >
              Cancelar
            </button>


                  <button
                    type="submit"
                    disabled={!userId} // Deshabilitado si userId es null
                    className="w-full sm:w-auto h-12 px-8 rounded-lg bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white font-semibold shadow-lg shadow-blue-500/50 hover:from-[#3b82f6] hover:to-[#1e40af] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Guardar Cambios
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* INFO */}
          <div className="bg-gradient-to-r from-[#d4edff] to-[#e3f5ff] rounded-xl p-6 border border-[#90d5ff]/30 text-black">
            <h3 className="text-lg font-semibold mb-2">Información de Cuenta</h3>
            <p className="text-sm leading-relaxed">
              Información como el correo electrónico no puede ser modificada desde esta página. Si necesitas cambiar tu correo, por favor contacta al soporte.
            </p>
            <p className="text-sm leading-relaxed mt-1">
              Recuerda mantener tu información actualizada para una mejor experiencia.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}