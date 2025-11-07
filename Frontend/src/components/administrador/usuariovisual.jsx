"use client"

import { useState } from "react"
import UserList from "./usuarios"
import UserForm from "./form_usuario"

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const handleAddUser = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDeleteUser = (id) => {
    setUsers(users.filter(u => u.id !== id))
  }

  const handleSubmitUser = (data) => {
    if (editingUser) {
      // Actualizar
      setUsers(users.map(u => (u.id === editingUser.id ? { ...u, ...data } : u)))
    } else {
      // Crear
      setUsers([...users, { id: Date.now(), ...data }])
    }
    setShowForm(false)
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {showForm ? (
        <UserForm
          initialData={editingUser}
          onSubmit={handleSubmitUser}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <UserList
          users={filteredUsers}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
    </>
  )
}
