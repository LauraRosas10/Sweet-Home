import Producto from "../schemas/productosSch.js";

class productoModel {
    async create(producto) {
        return await Producto.create(producto);
    }

    async getAll() {
        return await Producto.find()
            .populate("Categoria", "Nombre -_id")
            .populate("UsuarioCreador", "Nombre Email -_id"); 
    }

    async getAllPaginated(page, limit) {
    const skip = (page - 1) * limit;

    const [total, productos] = await Promise.all([
        Producto.countDocuments({ Visible: true }),

        Producto.find({ Visible: true })
            .skip(skip)
            .limit(limit)
            .select("Nombre Precio Stock Imagen Categoria") // selecciona lo necesario
            .lean() // convierte a JSON directo, 50–100% más rápido
    ]);

    return { total, productos };
}


    async getOneById(id) {
        return await Producto.findById(id)
            .populate("Categoria", "Nombre -_id");
    }

    async getByUsuario(idUsuario) {
        return await Producto.find({ UsuarioCreador: idUsuario })
            .populate("Categoria", "Nombre -_id"); 
    }

    async update(id, data) {
        return await Producto.findByIdAndUpdate(id, data, { new: true })
        .populate("UsuarioCreador", "Nombre Email")

    }

    async delete(id) {
        return await Producto.findByIdAndDelete(id);
    }
}

export default new productoModel();
