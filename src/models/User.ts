import { model, Schema } from "mongoose";

// Definindo o schema do User
const userSchema = new Schema({
  name: { type: String },
  cpf: { type: String },
  lastActive: { type: Number },
  isActive: { type: Boolean, default: true },
  phone: { type: String },
  token: { type: String },
  address: { type: String },
  neighborhood: { type: String },
  cep: { type: String },
  city: { type: String },
  state: { type: String },
  // role: { type: String, enum: ["Aluno", "Professor", "Funcionario", "Mentor"] },
  email: { type: String, required: true },
  password: { type: String, required: true },
  oldPassword: { type: String },
  userInformation: {
    trial: {
      onTrial: { type: Boolean, default: false },
      dateStart: { type: Number },
      dateEnd: { type: Number },
    },
    configuration: {
      darkMode: { type: Boolean },
      emailNotification: { type: Boolean },
      terms: { 
        dateTerm: { type: Number },
        acceptTerm: { type: Boolean }
      },
      evaluation: { type: Boolean },
    },
    benefits: [{ type: String, enum: ['Banco_de_questoes', 'Cronograma_sem_video_aulas', 'Cronograma_com_video_aulas', 'Todos_cursos', 'Mentoria'] }],
  },
  createdAt: { type: Number, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updateBy: { type: Schema.Types.ObjectId, ref: "User" },
  updateAt: { type: Number },
  bubbleId: { type: String },
});

export const Users = model("User", userSchema);