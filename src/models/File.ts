import { model, Schema } from "mongoose";

// File Schema
const fileSchema = new Schema({
  type: { type: String }, // Tipo de arquivo (ex.: imagem, vídeo)
  name: { type: String, required: true }, // Nome do arquivo
  title: { type: String }, // Título do arquivo
  url: { type: String, required: true }, // URL do arquivo
  alt: { type: String }, // Texto alternativo (para acessibilidade)
  width: { type: Number }, // Largura do arquivo (se aplicável)
  height: { type: Number }, // Altura do arquivo (se aplicável)
  size: { type: Number }, // Tamanho do arquivo (em KB, por exemplo)
  time: { type: Number }, // Duração do arquivo (em segundos, por exemplo)
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Usuário que criou o arquivo
  updateBy: { type: Schema.Types.ObjectId, ref: "User" }, // Usuário que atualizou o arquivo
  createdAt: { type: Number, default: Date.now }, // Timestamp da criação
  updateAt: { type: Number }, // Timestamp da última atualização
  bubbleURL: { type: String },
});

export const Files = model("File", fileSchema);
