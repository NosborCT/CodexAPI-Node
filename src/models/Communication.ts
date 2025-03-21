import { model, Schema } from "mongoose";

// Communication Schema
const communicationSchema = new Schema({
  description: { type: String, required: true }, // Descrição da comunicação
  title: { type: String, required: true }, // Título da comunicação
  createdAt: { type: Number, default: Date.now }, // Tempo de criação
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Criado por
  updateBy: { type: Schema.Types.ObjectId, ref: "User" }, // Atualizado por
  updateAt: { type: Number }, // Tempo de atualização
  wasSent: { type: Boolean, default: false },  // Saber se ja foi enviado
  sentAt: { type: Number }, // data do envio do comunicado
});

export const Communications = model("Communication", communicationSchema);
