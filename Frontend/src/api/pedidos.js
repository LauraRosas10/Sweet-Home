import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5100/api",
});

// Agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMyPurchases = async () => {
  const res = await api.get("/pedidos/mios");
  return res.data;
};

// Crear un pedido
export const createOrder = async (orderData) => {
  try {
    const res = await api.post("http://localhost:5100/api/pedidos", orderData);
    return res.data;
  } catch (error) {
    console.log("Error response:", error.response?.data); // <-- IMPORTANTE
    throw error;
  }
};
