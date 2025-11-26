import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSign, Search, Clock, AlertTriangle, Package } from "lucide-react";

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "N/A";
    return date.toISOString().split("T")[0];
}

export default function SalesTransactions() {
    const [searchTerm, setSearchTerm] = useState("");
    const [salesData, setSalesData] = useState([]);   // <- Data original
    const [flattenedData, setFlattenedData] = useState([]); // <- Todos los productos
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const url= import.meta.env.VITE_API;

    const API_URL = `${url}`;

    useEffect(() => {
        const fetchSales = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("No hay una sesión activa. Por favor, inicia sesión.");
                setIsLoading(false);
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/api/pedidos/misventas`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setSalesData(res.data);

                // 🔥 APLANA CADA PEDIDO EN MUCHAS FILAS, UNA POR PRODUCTO
                const flat = res.data.flatMap(pedido =>
                    pedido.Productos.map(prod => ({
                        _id: pedido._id + "_" + prod._id,
                        producto: prod.Producto,
                        cantidad: prod.Cantidad,
                        precio: prod.Producto.Precio,
                        comprador: pedido.Usuario,
                        fecha: pedido.createdAt,
                        estado: pedido.Estado
                    }))
                );

                setFlattenedData(flat);
                console.log("REGISTROS APLANADOS:", flat);

                setError(null);
            } catch (err) {
                console.error("Error obteniendo ventas:", err);
                const msg = err.response?.data?.error || "Error de conexión con el servidor.";
                setError(msg);
                setSalesData([]);
                setFlattenedData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSales();
    }, []);

    // 🔍 FILTRAR POR NOMBRE DE PRODUCTO
    const filtered = flattenedData.filter(item =>
        item.producto?.Nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStateStyles = (state) => {
        const lower = state?.toLowerCase();
        switch (lower) {
            case "enviado":
                return { color: "text-yellow-800", bg: "bg-yellow-100", dot: "bg-yellow-500" };
            case "entregado":
                return { color: "text-green-800", bg: "bg-green-100", dot: "bg-green-500" };
            case "cancelado":
                return { color: "text-red-800", bg: "bg-red-100", dot: "bg-red-500" };
            default:
                return { color: "text-blue-800", bg: "bg-blue-100", dot: "bg-blue-500" };
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 mt-8">
                <Clock className="animate-spin h-6 w-6 text-blue-500" />
                <span className="ml-2">Cargando ventas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 mt-8 bg-red-100 border border-red-300 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 text-red-700">
                    <AlertTriangle className="h-6 w-6" />
                    <h2 className="text-lg font-semibold">Error al cargar ventas</h2>
                </div>
                <p className="mt-2 text-sm">{error}</p>
            </div>
        );
    }

    if (flattenedData.length === 0) {
        return (
            <div className="p-6 mt-8 bg-gray-100 rounded-xl text-center">
                <Package className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <p className="text-lg font-semibold">¡Aún no has realizado ventas!</p>
            </div>
        );
    }

    return (
        <div className="mt-2 @container">
            {/* 🔍 Barra de búsqueda */}
            <div className="mb-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre de producto..."
                        className="w-full px-4 py-2.5 pl-10 rounded-xl border bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border bg-white shadow-lg">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-sm font-semibold uppercase text-gray-600">
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3">Comprador</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3 text-right">Precio</th>
                            <th className="px-4 py-3 text-right">Cantidad</th>
                            <th className="px-4 py-3">Estado</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {filtered.map(item => {
                            const styles = getStateStyles(item.estado);

                            return (
                                <tr key={item._id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg bg-cover bg-center border"
                                                style={{
                                                    backgroundImage: `url("${item.producto?.Imagen ||
                                                        "https://placehold.co/100x100"}")`
                                                }}
                                            />
                                            <span className="truncate">
                                                {item.producto?.Nombre || "Desconocido"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        {item.comprador?.Nombre || "N/A"}
                                    </td>

                                    <td className="px-4 py-3 text-gray-500">
                                        {formatDate(item.fecha)}
                                    </td>

                                    <td className="px-4 py-3 text-right font-bold">
                                        ${item.precio.toLocaleString("es-CO")}
                                    </td>

                                    <td className="px-4 py-3 text-right font-bold">
                                        {item.cantidad}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-full text-xs font-semibold ${styles.bg} ${styles.color}`}>
                                            <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                                            {item.estado}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" className="py-4 text-center text-gray-500">
                                    No se encontraron ventas que coincidan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
