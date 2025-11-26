import React, { useState, useRef, useEffect } from "react";
import { Store, Mail, Lock, Eye, EyeOff, Upload, X, CheckCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { showToast } from "../toast.js";

export function ModalInicio({ open, onOpenChange, onLoginSuccess }) {
    const [authMode, setAuthMode] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    
    // Estado para mensajes (éxito o error)
    const [message, setMessage] = useState(null); // { text: "...", type: "success" | "error" }

    // Datos del usuario
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const fileInputRef = useRef(null);

    const API_URL = import.meta.env.VITE_API; // URL Backend

    // Función para mostrar mensajes temporales
    const displayMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000); // El mensaje desaparece después de 5 segundos
    };

    // Manejo de foto
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Manejar y validar el teléfono (solo 10 dígitos numéricos)
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // 1. Quitar caracteres no numéricos
        
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        
        setPhone(value);
        
        if (value.length > 0 && value.length !== 10) {
            setPhoneError("El teléfono debe tener exactamente 10 dígitos (ej: 3001234567).");
        } else {
            setPhoneError("");
        }
    };

    // Login con backend
    const loginUser = async () => {
        setMessage(null); // Limpiar mensaje anterior
        try {
            const response = await axios.post(`${API_URL}/api/usuarios/login`, {
                Email: email,       
                Contraseña: password 
            });

            console.log("Respuesta de Login Exitosa:", response.data);

            // 🟢 CORRECCIÓN CLAVE: Desestructurar todos los campos necesarios de response.data
            const { token, role, userId, Nombre, Apellidos, Foto } = response.data; 

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", userId);
            
            // 🟢 CORRECCIÓN: Usar las variables desestructuradas
            localStorage.setItem("userPhoto", Foto); 
            localStorage.setItem("userName", `${Nombre} ${Apellidos}`); 

            // PASAR el rol al callback
            if (onLoginSuccess) {
                // Notificar éxito antes de cerrar el modal
                onLoginSuccess(role); 
            }

            // Ya no es necesario forzar la recarga aquí, el Header debería manejar la lógica.
            // onLoginSuccess ya cerrará el modal y actualizará el estado del Header.

        } catch (error) {
            const errorMsg = error.response?.data?.error || "Verifique su correo y contraseña.";
            console.error("Error al iniciar sesión:", error.response?.data || error.message);
            
            // ⚠️ Mostrar mensaje de error sin bloquear la UI
            displayMessage(errorMsg, "error");
        }
    };


    // Registro con backend
    const registerUser = async () => {
        setMessage(null); // Limpiar mensaje anterior
        
        // Validación final de 10 dígitos antes de enviar al backend
        if (phone.length !== 10) {
            setPhoneError("El teléfono debe tener exactamente 10 dígitos.");
            displayMessage("Por favor, corrige el campo de teléfono.", "error");
            return;
        }

        try {
            const formData = {
                Nombre: firstName,
                Apellidos: lastName,
                Email: email,
                Contraseña: password,
                Rol: "Cliente", 
                Telefono: phone,
                Descripcion: "",
                Foto: "" 
            };

            const submitRegistration = async (fotoBase64 = "") => {
                formData.Foto = fotoBase64;
                
                await axios.post(`${API_URL}/api/usuarios/register`, formData);

                // ✨ LÓGICA DE CAMBIO A LOGIN DESPUÉS DEL REGISTRO
                displayMessage("¡Registro exitoso! Por favor, inicia sesión.", "success");
                setAuthMode("login");
                
                // Limpiar campos del registro
                setFirstName("");
                setLastName("");
                setPhone("");
                setPhotoPreview(null);
                setPhotoFile(null);
                setEmail("");
                setPassword("");
            };


            if (photoFile) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    await submitRegistration(reader.result);
                };
                reader.readAsDataURL(photoFile); // convierte a base64
            } else {
                await submitRegistration("");
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || "Error al registrarse. Intente con otro correo.";
            console.error("Error de Registro:", error.response?.data || error.message);
            
            // ⚠️ Mostrar mensaje de error sin bloquear la UI
            displayMessage(errorMsg, "error");
        }
    };


    // Submit del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (authMode === "login") {
            loginUser();
        } else {
            registerUser();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent px-4 pt-70">


            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 relative shadow-2xl max-h-[95vh] overflow-y-auto transform transition-all">

                {/* Cerrar */}
                <button
                onClick={() => onOpenChange(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500 transition"
                >
                <X className="h-5 w-5" />
                </button>

                {/* Imagen/Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-500 overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700 shadow-md">
                        <Store className="h-10 w-10 text-blue-500 dark:text-blue-300" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-3">
                        SWEET HOME
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Inicia sesión o crea una cuenta
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                        onClick={() => { setAuthMode("login"); setMessage(null); }}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            authMode === "login"
                                ? "bg-white dark:bg-blue-700 text-blue-700 dark:text-white shadow-md"
                                : "text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => { setAuthMode("register"); setMessage(null); }}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            authMode === "register"
                                ? "bg-white dark:bg-blue-700 text-blue-700 dark:text-white shadow-md"
                                : "text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === "register" && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nombre</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Nombre"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Apellidos</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Apellidos"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Teléfono</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange} 
                                    placeholder="3001234567 (10 dígitos)"
                                    inputMode="numeric" 
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${phoneError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                    required
                                />
                                {/* MENSAJE DE ERROR VISUAL */}
                                {phoneError && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3 inline" />{phoneError}
                                    </p>
                                )}
                            </div>

                            {/* Foto */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Foto de perfil (Opcional)</label>
                                <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <div className="relative">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="h-16 w-16 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 rounded-full border border-dashed border-gray-400 flex items-center justify-center dark:border-gray-600">
                                    <Upload className="h-5 w-5 text-gray-400" />
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className="cursor-pointer px-4 py-2 border border-blue-500 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 transition"
                                >
                                    {photoPreview ? "Cambiar foto" : "Subir foto"}
                                </label>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Correo electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {authMode === "login" && (
                        <div className="text-right text-sm mb-2">
                            <a href="#" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 transition">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={authMode === 'register' && phoneError}
                        className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-[0.99] disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                        {authMode === "login" ? "Iniciar Sesión" : "Registrarse"}
                    </button>
                </form>
                
                {/* 🟢 TOAST MESSAGE CONTAINER */}
                {message && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
}