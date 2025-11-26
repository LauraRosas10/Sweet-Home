import pedidoModel from "../models/pedidosM.js";
import productoModel from "../models/productosM.js";
import Pedido from "../schemas/pedidosSch.js";  // Asegúrate que está importado arriba

class pedidoController {

  // Crear un nuevo pedido
  async create(req, res) {
    try {
      const { Productos, Total, DireccionEntrega, MetodoPago } = req.body;

      // Verificar productos
      for (const item of Productos) {
        const producto = await productoModel.getOneById(item.Producto);
        if (!producto) {
          return res.status(400).json({ error: `El producto con ID ${item.Producto} no existe` });
        }

        if (producto.Stock < item.Cantidad) {
          return res.status(400).json({ error: `No hay stock suficiente para ${producto.Nombre}` });
        }
      }

      // Restar stock
      for (const item of Productos) {
        const producto = await productoModel.getOneById(item.Producto);

        producto.Stock -= item.Cantidad;

        if (producto.Stock <= 0) {
          producto.Stock = 0;
          producto.Estado = "Agotado";
        }

        await producto.save();
      }

      // Crear el pedido
      const nuevoPedido = await pedidoModel.create({
        Usuario: req.user.id,
        Productos,
        Total,
        DireccionEntrega,
        MetodoPago,
        FechaPedido: new Date()
      });

      res.status(201).json({ msg: "Pedido creado correctamente", pedido: nuevoPedido });

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }


  // Obtener todos los pedidos
  async getAll(req, res) {
    try {
      if (req.user.Rol !== "Admin") {
        return res.status(403).json({ error: "Acceso denegado" });
      }

      const pedidos = await pedidoModel.getAll();
      res.json(pedidos);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }


  // Obtener pedidos del usuario autenticado
  async getByUser(req, res) {
    try {
      const pedidos = await pedidoModel.getByUser(req.user.id);
      res.json(pedidos);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }


  // Obtener mis ventas (productos creados por mí que se vendieron)

async getMySales(req, res) {
  try {
    const usuarioId = req.user.id;

    const pedidos = await Pedido.find()
      .populate({
        path: "Productos.Producto",
        select: "Nombre Imagen Precio UsuarioCreador",
        populate: {
          path: "UsuarioCreador",
          select: "Nombre Email"
        }
      })
      .populate("Usuario", "Nombre Email");

    // FILTRO CORREGIDO ✔
    const ventas = pedidos.filter(p =>
      p.Productos.some(prod =>
        prod.Producto?.UsuarioCreador?._id?.toString() === usuarioId
      )
    );

    res.json(ventas);
  } catch (error) {
    console.error("Error obteniendo ventas:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
}




  // Actualizar pedido
  async update(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoModel.getOne(id);

      if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

      if (req.user.Rol !== "Admin" && pedido.Usuario.toString() !== req.user.id) {
        return res.status(403).json({ error: "Acceso denegado" });
      }

      if (pedido.Estado !== "Cancelado" && req.body.Estado === "Cancelado") {
        for (const item of pedido.Productos) {
          const producto = await productoModel.getOneById(item.Producto);
          if (producto) {
            producto.Stock += item.Cantidad;
            await producto.save();
          }
        }
      }

      const actualizado = await pedidoModel.update(id, req.body);
      res.json({ msg: "Pedido actualizado", pedido: actualizado });

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }


  // Eliminar pedido
  async delete(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidoModel.getOne(id);

      if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });

      if (req.user.Rol !== "Admin" && pedido.Usuario.toString() !== req.user.id) {
        return res.status(403).json({ error: "Acceso denegado" });
      }

      await pedidoModel.delete(id);
      res.json({ msg: "Pedido eliminado correctamente" });

    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

export default new pedidoController();
