import { Search, Bell, User, Store, Moon, Sun, Plus } from "lucide-react"
import { useState } from "react"
import { useTheme } from "../thema.jsx"

export default function Header() {
const [searchQuery, setSearchQuery] = useState("")
const { isDark, toggleDark } = useTheme()

return (
    <header className={isDark ? "dark" : ""}>
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-primary to-accent p-2">
                <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
                Sweet Home
            </span>
            </div>

            {/* Search Bar */}
            <div className="mx-4 flex-1 max-w-2xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
                <input
                type="text"
                placeholder="Buscar productos, marcas o categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-primary dark:focus:ring-primary/20"
                />
            </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105">
                <Plus className="h-4 w-4" />
                Vender
            </button>

            <button
                onClick={toggleDark}
                className="rounded-full p-2.5 bg-white dark:bg-gray-800 shadow hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
            >
                {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-900" />}
            </button>

            <button className="relative rounded-full p-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                3
                </span>
            </button>

            <button className="rounded-full p-2.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary">
                <User className="h-5 w-5" />
            </button>
            </div>
        </div>
        </div>
    </div>
    </header>
)
}
