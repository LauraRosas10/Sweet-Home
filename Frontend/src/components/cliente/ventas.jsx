import { useState, useEffect } from "react";
import axios from "axios";

// función segura para formatear fechas
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";
  return date.toISOString().split("T")[0];
}

export default function SalesTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5100/api/pedidos/misventas",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setSalesData(res.data);
        console.log("VENTAS RECIBIDAS:", res.data);

      } catch (error) {
        console.log("Error obteniendo ventas:", error);
      }
    };

    fetchSales();
  }, []);

  // 🔍 FILTRO POR NOMBRE DE PRODUCTO
  const filteredData = salesData.filter((item) =>
    item.Producto?.Nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-2 @container">

      {/* 🔎 Barra de búsqueda */}
<div className="mb-3">
  <div className="relative">
    <input
      type="text"
      placeholder="Buscar por nombre de producto..."
      className="
        w-full px-4 py-2.5
        rounded-xl
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        shadow-sm
        focus:outline-none
        focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600
        focus:border-blue-400
        transition-all
        pl-10
      "
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />

    {/* Ícono de búsqueda */}
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
      />
    </svg>
  </div>
</div>


      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="w-full text-gray-900 dark:text-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr className="text-left">
              <th className="px-4 py-3 w-2/12">Producto</th>
              <th className="px-4 py-3 w-3/12">Comprador</th>
              <th className="px-4 py-3 w-2/12">Fecha</th>
              <th className="px-4 py-3 w-2/12">Precio</th>
              <th className="px-4 py-3 w-2/12">Estado</th>
              <th className="px-4 py-3 w-1/12">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                
                {/* PRODUCTO */}
                <td className="px-4 py-2 h-[72px]">
                  <div className="flex items-center gap-3">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 h-10"
                      style={{ backgroundImage: `url("${item.Producto?.Imagen || ""}")` }}
                    />
                    <span className="font-medium">
                      {item.Producto?.Nombre || "N/A"}
                    </span>
                  </div>
                </td>

                {/* COMPRADOR */}
                <td className="px-4 py-2">
                  {item.Usuario?.Nombre || "N/A"}
                </td>

                {/* FECHA */}
                <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                  {formatDate(item.createdAt)}
                </td>

                {/* PRECIO */}
                <td className="px-4 py-2">
                  ${item.Producto?.Precio || 0}
                </td>

                {/* ESTADO */}
                <td className="px-4 py-2">
                  <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                    <span className="size-2 rounded-full bg-blue-500"></span>
                    {item.Estado || "Pendiente"}
                  </div>
                </td>

                {/* ACCIONES */}
                <td className="px-4 py-2">
                  <a className="text-blue-600 dark:text-blue-400 hover:underline" href="#">
                    Ver detalles
                  </a>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <p className="p-4 text-center text-gray-500">
            No se encontraron ventas con ese nombre.
          </p>
        )}

      </div>
    </div>
  );
}
