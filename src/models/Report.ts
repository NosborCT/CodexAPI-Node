import { model, Schema } from "mongoose";

const reportCommentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

const reportSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    departament: { type: String, enum: ["TI", "Administrativo"]},
    status: { type: String, enum: ["Pendente", "Em progresso", "Resolvido", "Fechado"], default: "Pendente" },
    priority: { type: String, enum: ["Baixo", "Medio", "Alto", "Critico"], required: true },
    reportComments: { type: [Schema.Types.ObjectId], ref: "ReportComment"},
    reportFiles: [{ type: Schema.Types.ObjectId, ref: "File" }],
    createdAt: { type: Number, default: Date.now },
    updateAt: { type: Number },
})


export const ReportComments = model("ReportComment", reportCommentSchema)
export const Reports = model("Report", reportSchema);