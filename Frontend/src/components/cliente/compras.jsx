import { useEffect, useState } from "react";
import { getMyPurchases } from "../../api/pedidos";

export default function PurchaseTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [flatProducts, setFlatProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPurchases()
      .then((data) => {
        console.log("Compras del usuario:", data);

        // Aplana todos los productos de todos los pedidos
        const productsList = data.flatMap((pedido) =>
          pedido.Productos.map((p) => ({
            pedidoId: pedido._id,
            fecha: pedido.FechaPedido,
            estado: pedido.Estado,
            cantidad: p.Cantidad,
            producto: p.Producto,
          }))
        );

        setFlatProducts(productsList);
      })
      .catch((err) => console.error("Error cargando compras:", err))
      .finally(() => setLoading(false));
  }, []);

  // 🔍 Filtro simple por nombre de producto
  const filtered = flatProducts.filter((item) =>
    item.producto?.Nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Cargando compras...</p>;

  return (
    <div className="mt-2 @container">
              {/* 🔍 Barra de búsqueda */}
{/* 🔍 Barra de búsqueda */}
<div className="p-3">
  <div className="relative">
    <input
      type="text"
      placeholder="Buscar producto..."
      className="
        w-full px-4 py-2.5
        rounded-xl
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-slate-800
        text-gray-900 dark:text-gray-200
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

    {/* Icono de búsqueda */}
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

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900/60">



        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800/80">
            <tr className="text-left">
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Precio uni.</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

            {filtered.map((item) => (
              <tr key={item.pedidoId + item.producto?._id}>

                {/* IMG */}
                <td className="px-4 py-2">
                  <img
                    src={item.producto?.Imagen || ""}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </td>

                {/* NOMBRE */}
                <td className="px-4 py-2">
                  <span>{item.producto?.Nombre || "N/A"}</span>
                </td>

                {/* FECHA */}
                <td className="px-4 py-2">
                  {(() => {
                    const d = new Date(item.fecha);
                    return isNaN(d) ? "N/A" : d.toISOString().split("T")[0];
                  })()}
                </td>

                {/* PRECIO */}
                <td className="px-4 py-2">${item.producto?.Precio || 0}</td>

                {/* CANTIDAD */}
                <td className="px-4 py-2">{item.cantidad}</td>

                {/* ESTADO */}
                <td className="px-4 py-2">
                  <span className="bg-blue-100 px-3 py-1 rounded-full text-xs">
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="p-4 text-center text-gray-500">
            No se encontraron productos.
          </p>
        )}
      </div>
    </div>
  );
}
