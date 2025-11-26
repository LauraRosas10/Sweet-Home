import { useState, useEffect } from "react"; // 1. Importar useEffect

export default function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const pedidos= import.meta.env.VITE_API_URL;

  // 2. Inicializar orders con un arreglo vacío
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // Función para mapear el estado de MongoDB al formato del frontend
  const getStatusColor = (status) => {
    switch (status) {
      case "Entregado":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "Enviado":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "Pendiente":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300";
    }
  };

  // 3. useEffect para cargar los pedidos al montar el componente
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token'); // Asume que guardas el token en localStorage
      if (!token) {
        setError("Token de autenticación no encontrado.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${pedidos}/pedidos/`, { // Reemplaza con tu URL API
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error al obtener pedidos: ${response.status}`);
        }

        const data = await response.json();
console.log("Pedidos formateados:", data);

        // 4. Mapear los datos de la API al formato que usa la tabla
        const formattedOrders = data.map((order) => ({
          id: order._id, // Usar el ID de MongoDB
          customer: order.Usuario?.Email ?? "Usuario Desconocido", // Asume que el usuario está populado y tiene un campo Nombre
          date: new Date(order.FechaPedido).toLocaleDateString("es-ES"), // Formatear la fecha
          status: order.Estado,
          total: `$${order.Total.toFixed(2)}`,
          statusColor: getStatusColor(order.Estado),
          originalOrder: order, // Guardar el objeto completo si es necesario
        }));



        setOrders(formattedOrders);
        setError(null);
      } catch (err) {
        console.error("Error cargando pedidos:", err.message);
        setError("No se pudieron cargar los pedidos. " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // El array vacío asegura que solo se ejecute al montar

  const handleEditClick = (order) => {
    // Necesitas mapear el orden del frontend a lo que usa el modal si usaste 'originalOrder'
    setEditingOrder({ ...order }); 
    setIsEditModalOpen(true);
  };

  const handleSaveOrder = async () => { // Hacerla asíncrona para la petición PUT
    const statusColorMap = {
      Entregado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      Enviado: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      Pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    };

    const updatedOrder = {
      ...editingOrder,
      statusColor: statusColorMap[editingOrder.status],
    };

    try {
      // Lógica para actualizar en el backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${pedidos}/pedidos/${updatedOrder.id}`, { // Reemplaza con tu URL API
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Estado: updatedOrder.status,
          // Otros campos a actualizar (Fecha, Total, etc.) si se habilitan
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar pedido.");
      }

      // Actualizar el estado local después de una actualización exitosa
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );

      setIsEditModalOpen(false);
      setEditingOrder(null);
    } catch (err) {
      console.error("Error al guardar cambios:", err.message);
      alert("Error al guardar cambios: " + err.message);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-black dark:text-gray-200">
      {/* CONTENIDO */}
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Pedidos</h1>

            
          </div>

          {/* BUSCAR */}
          {/* ... (tu código de búsqueda) ... */}
          <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border p-6 mb-6">
            <span className="block mb-3 text-sm font-semibold">Buscar pedido</span>
            <input
            type="text"
            placeholder="Buscar por ID o cliente"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* INDICADORES DE CARGA/ERROR */}
          {loading && (
            <div className="text-center py-4 text-blue-500">Cargando pedidos...</div>
          )}
          {error && (
            <div className="text-center py-4 text-red-500 bg-red-100 dark:bg-red-900/40 rounded-lg mb-4">{error}</div>
          )}

          {/* TABLA */}
          {!loading && !error && (
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-2xl border overflow-hidden">
              <table className="w-full text-sm">
                {/* ... (thead) ... */}
                <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">ID Pedido</th>
                    <th className="px-6 py-4 text-left font-bold">Cliente_Email</th>
                    <th className="px-6 py-4 text-left font-bold">Fecha</th>
                    <th className="px-6 py-4 text-left font-bold">Estado</th>
                    <th className="px-6 py-4 text-right font-bold">Total</th>
                    <th className="px-6 py-4 text-center font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-semibold">{order.id}</td>
                      <td className="px-6 py-4">{order.customer}</td>
                      <td className="px-6 py-4">{order.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{order.total}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEditClick(order)}
                          className="px-3 py-1 rounded-lg text-white bg-gradient-to-r from-[#4ea8de] to-[#3b8cc4] dark:from-[#1b5f8a] dark:to-[#164a6a]"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No se encontraron pedidos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {/* ... (tu código del modal) ... */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 dark:text-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">

            <h2 className="text-xl font-bold mb-4">Editar Pedido</h2>

            <div className="space-y-3">
            <div>
                <label className="text-sm font-semibold">ID</label>
                <input disabled value={editingOrder.id} className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div>
                <label className="text-sm font-semibold">Cliente</label>
                {/* Se deshabilitó la edición del cliente, ya que el modal no lo mapea correctamente */}
                <input
                disabled
                value={editingOrder.customer}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>

            <div>
                <label className="text-sm font-semibold">Fecha</label>
                <input
                disabled
                value={editingOrder.date}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>

            <div>
                <label className="text-sm font-semibold">Estado</label>
                <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={editingOrder.status}
                onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                >
                <option>Pendiente</option>
                <option>Enviado</option>
                <option>Entregado</option>
                </select>
            </div>

            <div>
                <label className="text-sm font-semibold">Total</label>
                <input
                disabled
                value={editingOrder.total}
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
            <button
                onClick={() => {
                setIsEditModalOpen(false);
                setEditingOrder(null);
                }}
                className="px-4 py-2 rounded-lg border dark:border-gray-600 dark:text-white"
            >
                Cancelar
            </button>

            <button
                onClick={handleSaveOrder}
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#4ea8de] to-[#3b8cc4] dark:from-[#1b5f8a] dark:to-[#164a6a]"
            >
                Guardar Cambios
            </button>
            </div>

        </div>
        </div>
      )}
    </div>
  );
}