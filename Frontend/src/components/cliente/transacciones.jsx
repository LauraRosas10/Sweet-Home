    import { useState } from "react"
    import SalesTransactions from "./ventas"
    import PurchaseTransactions from "./compras"

    export default function TransactionsPage() {
    const [activeTab, setActiveTab] = useState("sales")
    const [searchTerm, setSearchTerm] = useState("")

    return (
        <div className="min-h-screen font-display bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex min-w-72 flex-col gap-2">
                <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900 dark:text-white">
                    Mis Transacciones
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400">
                    Gestiona tus productos vendidos y comprados.
                </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 dark:border-gray-700">
                <div className="flex gap-8">
                <button
                    onClick={() => setActiveTab("sales")}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-1 transition-all
                    ${
                        activeTab === "sales"
                        ? "border-b-primary text-primary font-bold"
                        : "border-b-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                >
                    <p className="text-sm font-semibold">Productos Vendidos</p>
                </button>

                <button
                    onClick={() => setActiveTab("purchases")}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-1 transition-all
                    ${
                        activeTab === "purchases"
                        ? "border-b-primary text-primary font-bold"
                        : "border-b-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                >
                    <p className="text-sm font-semibold">Productos Comprados</p>
                </button>
                </div>
            </div>



            {/* Toolbar */}
 

            {/* Contenedor de datos */}


                          {/* ✅ Render dinámico de contenidos */}
      <div className="mt-4">
        {activeTab === "sales" && <SalesTransactions />}
        {activeTab === "purchases" && <PurchaseTransactions />}
      </div>

            </div>
        </main>
        </div>
    )
    }
