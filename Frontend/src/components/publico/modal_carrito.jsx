
import { useState } from "react"
import { X, Minus, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext";


export default function CartModal({ isOpen, onClose }) {

    const { 
        cartItems, 
        totalItems, 
        subtotal, 
        updateQuantity, 
        removeItem 
    } = useCart();

const navigate = useNavigate() // ✅ CAMBIO PARA VITE

const goToCartPage = () => {
    onClose()
    navigate("/pagecarrito") // ✅ CAMBIO PARA VITE
}






const total = subtotal 


if (!isOpen) return null

return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 dark:bg-black/60 ">
    <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

    <div className="relative flex flex-col h-[100vh] max-h-[100vh] w-full max-w-md rounded-l-xl bg-white shadow-2xl dark:bg-[#1C2433]">


        {/* Handle */}
        <button className="flex h-5 w-full items-center justify-center pt-3" onClick={onClose} aria-label="Close cart">
        <div className="h-1 w-9 rounded-full bg-[#dbdfe6] dark:bg-slate-700" />
        </button>

        {/* Header */}
        <div className="flex items-center p-4 pb-2">
   
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-foreground">
            My Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
        </h2>
        <div className="flex w-12 items-center justify-end">
            <button
            onClick={onClose}
            className="flex size-12 cursor-pointer items-center justify-center rounded-lg bg-transparent text-foreground transition-colors hover:bg-muted"
            aria-label="Close cart"
            >
            <X className="size-6" />
            </button>
        </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 bg-white max-h-[55vh] dark:bg-[#1C2433]">

        <div className="flex flex-col gap-4 ">
            {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4">
                <div className="flex flex-1 items-center gap-4">
                <div
                    className="size-16 shrink-0 rounded-lg bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${item.image}")` }}
                    role="img"
                    aria-label={item.name}
                />
                <div className="flex flex-col justify-center">
                    <p className="line-clamp-1 text-base font-medium leading-normal text-foreground">{item.name}</p>
                    <p className="line-clamp-2 text-sm font-normal leading-normal text-muted-foreground">
                    {item.details}
                    </p>
                    <p className="pt-1 text-base font-semibold text-[#256af4]">${item.price?.toFixed(2)}</p>
                </div>
                </div>
                <div className="shrink-0">
                <div className="flex items-center gap-2 text-foreground">
                    <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-base font-medium leading-normal transition-colors hover:bg-muted/80"
                    aria-label="Decrease quantity"
                    >
                    <Minus className="size-4" />
                    </button>
                    <span className="w-4 text-center text-base font-medium leading-normal">{item.quantity}</span>
                    <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-muted text-base font-medium leading-normal transition-colors hover:bg-muted/80"
                    aria-label="Increase quantity"
                    >
                    <Plus className="size-4" />
                    </button>
                </div>
                </div>
                <button
                onClick={() => removeItem(item.id)}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                aria-label="Remove item"
                >
                <X className="size-5" />
                </button>
            </div>
            ))}
        </div>
        </div>

        {/* Summary & Actions */}
        <div className="mt-auto border-t border-border bg-white p-4 dark:bg-[#1C2433]">
        <div className="flex flex-col gap-3">
            <div className="flex justify-between text-base">
            <p className="font-medium text-muted-foreground">Subtotal</p>
            <p className="font-medium text-foreground">${subtotal.toFixed(2)}</p>
            </div>

            <div className="flex justify-between text-lg font-bold">
            <p className="text-foreground">Total</p>
            <p className="text-[#256af4]">${total.toFixed(2)}</p>
            </div>
        </div>
        <div className="mt-6 flex flex-col gap-3">

            {/* ✅ BOTÓN YA FUNCIONA EN VITE */}
            <button
            onClick={goToCartPage}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#256af4] px-5 text-base font-bold leading-normal tracking-wide text-white transition-colors hover:bg-[#1e56d1]"
            >
            Resumen carrito
            </button>

            <button
            onClick={onClose}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#256af4]/20 px-5 text-base font-bold leading-normal tracking-wide text-[#256af4] transition-colors hover:bg-[#256af4]/30 dark:bg-[#256af4]/30"
            >
            Continue Shopping
            </button>
        </div>
        </div>
    </div>
    </div>
)
}
