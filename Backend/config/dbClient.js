import 'dotenv/config';
import mongoose from 'mongoose';

class dbClient {
    constructor() {
        this.connected = false; // evita reconexiones dobles
    }

    async connectarBaseDatos() {
        if (this.connected) return;

        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/SweetHomedb?retryWrites=true&w=majority`;

        try {
            await mongoose.connect(queryString, {
                serverSelectionTimeoutMS: 5000,   // ⬅ 5 segundos, no 30s
                connectTimeoutMS: 5000,           // ⬅ evita esperas eternas
                socketTimeoutMS: 45000
            });

            this.connected = true;
            console.log("✔ Conexión a MongoDB establecida");
        } catch (err) {
            console.error("❌ Error conectando a Mongo:", err);
            throw err;
        }
    }

    async cerrarConexion() {
        try {
            await mongoose.disconnect();
            console.log("✔ Conexión de Mongo cerrada");
        } catch (e) {
            console.log("❌ Error cerrando conexión", e);
        }
    }
}

export default new dbClient();
