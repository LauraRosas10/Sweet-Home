import Pedido from "../schemas/pedidosSch.js";

class pedidoModel {

    async find(filter = {}) {
  return await Pedido.find(filter);
}

    async create(pedido) {
        return await Pedido.create(pedido);
    }

    async getAll() {
        return await Pedido.find()
        .populate("Usuario", "Email -_id")
        .populate("Productos.Producto", "Nombre Precio -_id Imagen UsuarioCreador ");
    }

    async getOne(id) {
        return await Pedido.findById(id)
        .populate("Usuario", "Email -_id")
        .populate("Productos.Producto", "Nombre Precio -_id Imagen UsuarioCreador");
    }

    async getByUser(idUsuario) {
        return await Pedido.find({ Usuario: idUsuario })
         .populate({
            path: "Productos.Producto",
            select: "Nombre Precio Imagen UsuarioCreador",
            populate: {
                path: "UsuarioCreador",
                select: "Nombre Email"
            }
        });
    }

    async getMySales(usuarioId) {
        return await Pedido.find()
         .populate({
            path: "Productos.Producto",
            select: "Nombre Precio Imagen UsuarioCreador",
            populate: {
                path: "UsuarioCreador",
                select: "Nombre Email"
            }
        });
    }

    async update(id, data) {
        return await Pedido.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await Pedido.findByIdAndDelete(id);
    }
}

export default new pedidoModel();
