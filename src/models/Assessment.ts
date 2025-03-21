import { model, Schema } from 'mongoose';

export enum EvaluationType {
    NPS = 'NPS',
    QUALITY = 'Qualidade',
    SUPPORT = 'Suporte',
    EDUCATIONAL_MATERIAL = 'Material Educacional',
    USABILITY = 'Usabilidade'
}

const assessmentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluations: [{
        type: { type: String, enum: ['NPS', "QUALITY", "SUPPORT", "EDUCATIONAL_MATERIAL", "USABILITY"], required: true },
        value: { type: Number, required: true, min: 0, max: 10 }
    }],
    createdAt: { type: Number, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Number }
});

export const Assessments = model('Assessment', assessmentSchema);