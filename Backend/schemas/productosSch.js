import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
        Nombre : {
            type : String,
            required : true,
            trim : true
        },
        Descripcion : {
            type :String,
            required : true
        },
        Precio : {
            type : Number,
            required : true
        },
        Imagen : {
            type : String,
            required : true
        },
        Categoria : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Categorias",
            required : true
        },
        Stock : {
            type : Number,
            default : 0
        },
        Estado : {
            type : String,
            enum : ["Disponible", "Agotado"],
            default: "Disponible"
        },
        FechaCreacion : {
            type : Date,
            default : Date.now
        },
        UsuarioCreador : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "usuarios"
        },
        Visible :{
            type : Boolean,
            default : true
        }
});

// Middleware para setear Estado automaticamente en create y save
productoSchema.pre("save", function (next) {
    this.Estado = this.Stock > 0 ? "Disponible" : "Agotado";
    next();
});

// Middleware para update (findByIdAndUpdate / updateOne)
productoSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();

    // Si Stock está siendo actualizado...
    if (update.Stock !== undefined) {
        update.Estado = update.Stock > 0 ? "Disponible" : "Agotado";
        this.setUpdate(update);
    }

    next();
});

export default mongoose.model("productos", productoSchema);