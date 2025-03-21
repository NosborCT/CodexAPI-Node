import { model, Schema } from "mongoose";

const logSchema = new Schema({
    action: { type: String },
    data: { type: String },
    table: { type: String },
    createdAt: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updateBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updateAt: { type: Number }
});

export const Logs = model("Log", logSchema);