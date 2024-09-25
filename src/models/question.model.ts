import mongoose, { Schema, Model } from "mongoose";
import { IQuestionSchema } from "../../types/schemaTypes";
import { string } from "joi";

const QuestionSchema: Schema<IQuestionSchema> = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "category",
        required: [true, "Category Id is Required"]
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: "subcategory",
        required: [true, "Subcategory Id is Required"]
    },
    question: {
        type: String,
        required: [true, "Question is required"]
    },
    options: {
        type: Map,  
        of: String,   
        required: [true, "Options are required"]
    },
    optionSelected: {
        type: String,
        enum: ['A', 'B', 'C', 'D','E'],  
        required: false              
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });


const QuestionModel:Model<IQuestionSchema> = mongoose.model<IQuestionSchema>('question',QuestionSchema);
export default QuestionModel;
