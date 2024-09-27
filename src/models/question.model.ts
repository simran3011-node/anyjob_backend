import mongoose, { Document, Schema, Model, model } from 'mongoose';

// Interface for Derived Question
interface IDerivedQuestion extends Document {
  option: string;
  question: string;
  options: Map<string, string>;
  derivedQuestions: IDerivedQuestion[];
}

// Interface for Main Question
interface IQuestion extends Document {
  categoryId: mongoose.Types.ObjectId;
  subCategoryId: mongoose.Types.ObjectId;
  question: string;
  options: Map<string, string>;
  derivedQuestions: IDerivedQuestion[]; // Derived questions are stored here
}

// Schema for Derived Questions (Recursive Structure)
const derivedQuestionSchema = new Schema<IDerivedQuestion>({
  option: { type: String, required: true },
  question: { type: String, required: true },
  options: {
    type: Map,
    of: String,
    required: true,
  },
  derivedQuestions: [this] // Recursively storing derived questions
});

// Main Question Schema
const questionSchema = new Schema<IQuestion>({
  categoryId: { type: Schema.Types.ObjectId, required: true, ref: 'Category' },
  subCategoryId: { type: Schema.Types.ObjectId, required: true, ref: 'SubCategory' },
  question: { type: String, required: true },
  options: {
    type: Map,
    of: String,
    required: true,
  },
  derivedQuestions: [derivedQuestionSchema] // Storing derived questions within main question
});

// Create and export the Question model
const QuestionModel: Model<IQuestion> = model<IQuestion>('Question', questionSchema);
export default QuestionModel;


