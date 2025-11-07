"use client"

import { useState, useEffect } from "react"
import CategoryList from "./categorias"

export default function CategoryManagement() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Electrónica", description: "Productos electrónicos y tecnología", status: true },
    { id: 2, name: "Ropa de Invierno", description: "Prendas abrigadas para temporada fría", status: false },
    { id: 3, name: "Hogar y Jardín", description: "Artículos para el hogar y jardín", status: true },
    { id: 4, name: "Deportes", description: "Equipamiento deportivo y actividades físicas", status: true },
    { id: 5, name: "Juguetes y Juegos", description: "Entretenimiento para todas las edades", status: false },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", status: true })

  useEffect(() => {
    if (editingId) {
      const category = categories.find((cat) => cat.id === editingId)
      if (category) {
        setFormData(category)
      }
    } else {
      setFormData({ name: "", description: "", status: true })
    }
  }, [editingId, categories])

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSave = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim()) {
      if (editingId) {
        setCategories(categories.map((cat) => (cat.id === editingId ? { ...cat, ...formData } : cat)))
        setEditingId(null)
      } else {
        setCategories([...categories, { ...formData, id: Date.now() }])
      }
      setFormData({ name: "", description: "", status: true })
      setShowForm(false)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setShowForm(true)
  }

  const handleToggleStatus = (id) => {
    setCategories(categories.map((cat) => (cat.id === id ? { ...cat, status: !cat.status } : cat)))
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: "", description: "", status: true })
  }

  const isEditing = !!editingId

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {showForm ? (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-slate-800 p-4">
          <div className="max-w-2xl mx-auto w-full">
            {/* Form Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {isEditing ? "Editar Categoría" : "Nueva Categoría"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {isEditing ? "Actualiza los datos de la categoría" : "Crea una nueva categoría de productos"}
              </p>
            </div>

            {/* Form Card */}
            <form
              onSubmit={handleSave}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-900/30 p-8"
            >
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Electrónica, Ropa, Hogar..."
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe esta categoría..."
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Status Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Estado</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: !formData.status })}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        formData.status ? "bg-blue-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          formData.status ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formData.status ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-blue-200 dark:border-blue-900/30">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {isEditing ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <CategoryList
          categories={filteredCategories}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onAdd={() => setShowForm(true)}
        />
      )}
    </div>
  )
}
