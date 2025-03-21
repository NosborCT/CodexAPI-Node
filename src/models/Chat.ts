import { model, Schema } from "mongoose";

// ChatMessage Schema
const chatMessageSchema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true }, // Relacionamento com 'Chat'
  position: { type: Number }, // Posição da mensagem no chat
  text: { type: String, required: true }, // Texto da mensagem
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Usuário que enviou a mensagem
  createdAt: { type: Number, default: Date.now }, // Tempo de criação
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Criado por
  updateBy: { type: Schema.Types.ObjectId, ref: "User" }, // Atualizado por
  updateAt: { type: Number }, // Tempo de atualização
  bubbleId: { type: String },
});

// Chat Schema
const chatSchema = new Schema({
  isOpen: { type: Boolean, default: true }, // Indica se o chat está aberto
  messages: [{ type: Schema.Types.ObjectId, ref: "ChatMessage" }], // Mensagens do chat
  roomMeet: { type: Schema.Types.ObjectId, ref: "RoomMeet" }, // Relacionamento com 'RoomMeet'
  createdAt: { type: Number, default: Date.now }, // Tempo de criação
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Criado por
  updateBy: { type: Schema.Types.ObjectId, ref: "User" }, // Atualizado por
  updateAt: { type: Number }, // Tempo de atualização
  bubbleId: { type: String },
});

export const Chats = model("Chat", chatSchema);
export const ChatMessages = model("ChatMessage", chatMessageSchema);
