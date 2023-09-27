import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  console.log("Conectando a MongoDB...");
  mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
  db.once("open", () => {
    console.log("Conexión exitosa a MongoDB");
  });
};
