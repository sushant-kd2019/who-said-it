import mongoose, { Schema, Document } from 'mongoose';

export interface QuestionDocument extends Document {
  template: string;
  category?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<QuestionDocument>({
  template: { type: String, required: true, unique: true },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
}, { 
  timestamps: true,
  toJSON: {
    transform: (_, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster lookups
QuestionSchema.index({ isActive: 1 });
QuestionSchema.index({ category: 1 });
QuestionSchema.index({ usageCount: 1 }); // For selecting least-used questions

export const QuestionModel = mongoose.model<QuestionDocument>('Question', QuestionSchema);

