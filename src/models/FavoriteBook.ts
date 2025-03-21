import { model, Schema } from "mongoose";

// favoriteBook Schema
const favoriteBookSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Relacionamento com 'User'
  createdAt: { type: Number, default: Date.now }, // Tempo de criação
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Criado por
  updateBy: { type: Schema.Types.ObjectId, ref: "User" }, // Atualizado por
  updateAt: { type: Number }, // Tempo de atualização
  bubbleId: { type: String },
});

export const FavoriteBooks = model("FavoriteBook", favoriteBookSchema);
