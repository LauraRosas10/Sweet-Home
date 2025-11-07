import React, { useState, useRef } from "react";
import { Store, Mail, Lock, Eye, EyeOff, Upload, X } from "lucide-react";

export function ModalInicio({ open, onOpenChange ,onLoginSuccess}) {
const [authMode, setAuthMode] = useState("login");
const [showPassword, setShowPassword] = useState(false);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [phone, setPhone] = useState("");
const [photoPreview, setPhotoPreview] = useState(null);
const [photoFile, setPhotoFile] = useState(null);
const fileInputRef = useRef(null);

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

//para cerrar sesión
    const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
    };



const handleSubmit = (e) => {
e.preventDefault();

const adminUser = { email: "admin@gmail.com", password: "123456", role: "administrador" };
const clientUser = { email: "cliente@gmail.com", password: "123456", role: "cliente" };

let loggedUser = null;

if (email === adminUser.email && password === adminUser.password) {
    loggedUser = adminUser;
} else if (email === clientUser.email && password === clientUser.password) {
    loggedUser = clientUser;
}



if (loggedUser) {
    localStorage.setItem("token", "fake_jwt_123"); 
    localStorage.setItem("role", loggedUser.role);

        if (onLoginSuccess) {
      onLoginSuccess(loggedUser.role);
      return;
    }

        alert(`Bienvenido ${loggedUser.role.toUpperCase()}`);
        if (loggedUser.role === "administrador") {
        window.location.href = "/";
        } else {
        window.location.href = "/perfil";
        }
} else {
    alert("Credenciales incorrectas");
}
};


if (!open) return null;

return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 py-150">
    <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 relative shadow-lg">
        {/* Cerrar */}
        <button
        onClick={() => onOpenChange(false)}
        className="absolute top-3 right-3 text-red-500 hover:text-red-700"
        >
        <X className="h-5 w-5" />
        </button>

        {/* Imagen de usuario */}
        <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden flex items-center justify-center bg-gray-200">
            <img
            src={photoPreview || "https://static.vecteezy.com/system/resources/previews/019/879/198/original/user-icon-on-transparent-background-free-png.png"}
            alt="Usuario"
            className="w-full h-full object-cover"
            />
        </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
        SWEET HOME
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-300 mb-4">
        Inicia sesión o crea una cuenta para continuar
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-4">
        <button
            onClick={() => setAuthMode("login")}
            className={`px-4 py-2 rounded-md ${
            authMode === "login"
                ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-white"
                : "text-gray-500 dark:text-gray-300"
            }`}
        >
            Iniciar Sesión
        </button>
        <button
            onClick={() => setAuthMode("register")}
            className={`px-4 py-2 rounded-md ${
            authMode === "register"
                ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-white"
                : "text-gray-500 dark:text-gray-300"
            }`}
        >
            Registrarse
        </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === "register" && (
            <>
            {/* Campos adicionales */}
            <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
                className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
                required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Apellidos</label>
                <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellidos"
                className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
                required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono"
                className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
                required
                />
            </div>

            {/* Foto */}
            <div>
                <label className="block text-sm font-medium mb-1">Foto de perfil (Opcional)</label>
                <div className="flex items-center gap-4">
                {photoPreview ? (
                    <div className="relative">
                    <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-20 w-20 rounded-full object-cover border"
                    />
                    <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    </div>
                ) : (
                    <div className="h-20 w-20 rounded-full border border-dashed flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
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
                    className="cursor-pointer px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white"
                >
                    {photoPreview ? "Cambiar foto" : "Subir foto"}
                </label>
                </div>
            </div>
            </>
        )}

        <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <div className="relative">
            <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-8 pr-3 py-2 border rounded-md focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
                required
            />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <div className="relative">
            <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full pl-8 pr-8 py-2 border rounded-md focus:ring focus:ring-blue-200 dark:bg-gray-800 dark:text-white"
                required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            >
                {showPassword ? <EyeOff /> : <Eye />}
            </button>
            </div>
        </div>

        {authMode === "login" && (
            <div className="text-right text-sm mb-2">
            <a href="#" className="text-blue-500 hover:underline">
                ¿Olvidaste tu contraseña?
            </a>
            </div>
        )}

        <button
            type="submit"
            className="w-full py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600"
        >
            {authMode === "login" ? "Iniciar Sesión" : "Registrarse"}
        </button>
        </form>
    </div>
    </div>
);
}
