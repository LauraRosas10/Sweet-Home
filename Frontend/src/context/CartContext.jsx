import React, { createContext, useState, useContext, useEffect } from "react";
import { showToast } from "../components/toast";
// Importamos useEffect para la persistencia de datos.

// Nombre de la clave para guardar en localStorage
const LOCAL_STORAGE_KEY = "shoppingCartItems";

// 1. Crear el Contexto
const CartContext = createContext();

// 2. Crear un Hook personalizado para usar el carrito
export const useCart = () => useContext(CartContext);

// 3. Crear el Provider
export const CartProvider = ({ children }) => {
    
    // 🟢 INICIALIZACIÓN: Leemos el carrito de localStorage al inicio
    const [cartItems, setCartItems] = useState(() => {
        try {
            const storedItems = localStorage.getItem(LOCAL_STORAGE_KEY);
            return storedItems ? JSON.parse(storedItems) : [];
        } catch (error) {
            console.error("Error al cargar el carrito de localStorage:", error);
            return []; // Retorna un array vacío si hay un error
        }
    });

    // 🟢 EFECTO DE SINCRONIZACIÓN: Guarda el carrito en localStorage cada vez que cartItems cambie
    useEffect(() => {
        try {
            // Guardamos el estado actual del carrito
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error("Error al guardar el carrito en localStorage:", error);
        }
    }, [cartItems]); // Se ejecuta cada vez que cartItems cambia

    /**
     * Función principal para añadir un producto o incrementar su cantidad.
     * @param {Object} product - El producto normalizado a añadir.
     */
    const addToCart = (product) => {
        setCartItems((prevItems) => {

            // Busca si el producto ya está en el carrito
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                // Si existe, incrementa la cantidad
                const newItems = prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                return newItems;
            } else {
                // Si no existe, añádelo con cantidad 1.
                const newItems = [
                    ...prevItems,
                    {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1,
                        details: product.category, 
                    },
                ];
                return newItems;
            }
        });
        
        showToast(`Se agregó ${product.name} al carrito.`);
    };

    /**
     * Elimina un artículo del carrito.
     * @param {string} id - El ID del producto a eliminar.
     */
    const removeItem = (id) => {
        setCartItems((prevItems) => {
            const newItems = prevItems.filter((item) => item.id !== id);
            return newItems;
        });
    };

    /**
     * Actualiza la cantidad de un artículo usando un delta (cambio relativo).
     * Función corregida: usa delta (+1 o -1) y elimina el ítem si la cantidad llega a 0.
     * @param {string} id - El ID del producto.
     * @param {number} delta - El cambio de cantidad (+1 o -1).
     */
    const updateQuantity = (id, delta) => {
        setCartItems((prevItems) => {
            const updatedItems = prevItems.map((item) => {
                if (item.id === id) {
                    // Calculamos la nueva cantidad, asegurando que no sea negativa (mínimo 0)
                    const newQuantity = Math.max(0, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            // Filtra los items con cantidad > 0 (así se elimina el ítem si se reduce a cero)
            return updatedItems.filter(item => item.quantity > 0);
        });
    };
    
    // Función para vaciar el carrito
    const clearCart = () => {
        setCartItems([]);
        // Opcional: podrías limpiar explícitamente localStorage aquí si fuera necesario
        // localStorage.removeItem(LOCAL_STORAGE_KEY);
    };
    
    // Calcular totales para el modal/página
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Los valores que se expondrán a los componentes
    const contextValue = {
        cartItems,
        totalItems,
        subtotal,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};