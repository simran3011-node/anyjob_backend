import { Response } from "express";
import { CustomRequest } from "../../types/commonType";
import QuestionModel from "../models/question.model";
import { ApiError } from "../utils/ApisErrors";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { IQuestionSchema, IServiceSchema } from "../../types/schemaTypes";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { ObjectId } from "mongoose";

export const fetchQuestionsSubCategorySubCategorywise = asyncHandler(async (req:CustomRequest,res:Response<IQuestionSchema>)=>{
    const {categoryId,subCategoryId } = req.params;

    const results = await QuestionModel.aggregate([
        {
            $match:{
                categoryId:new mongoose.Types.ObjectId(categoryId),
                subCategoryId:new mongoose.Types.ObjectId(subCategoryId),
            }
        },
        {
            $lookup:{
                from:"questions",
                localField:"_id",
                foreignField:"parentId",
                as:"derivedQuestion"
            }
        },
        {
            $addFields:{
                isDerivedQuestion: { $gt: [ { $size: "$derivedQuestion" }, 0 ] }            }
        },
        {
            $project:{
                derivedQuestion:0
            }
        }
    ])
    return sendSuccessResponse(res, 200, {
        results,

    }, "Questions retrieved successfully for the given Subcategory.");
});

export const fetchDerivedQuestion = asyncHandler(async (req:CustomRequest,res:Response<IQuestionSchema>)=>{
    const {questionId } = req.params;

    const results = await QuestionModel.aggregate([
        {
            $match:{
                parentId:new mongoose.Types.ObjectId(questionId)
            }
        }
    ])
    
    return sendSuccessResponse(res, 200, {
        results,

    }, "Derived Questions retrieved successfully for the given Subcategory.");
});


// export const addSubCategory = asyncHandler(async (req: CustomRequest, res: Response<ISubCategorySchema>) => {
//     const { categoryId, name, subCategoryImage, questionArray }: { categoryId: ObjectId, name: string, subCategoryImage: string, questionArray: Array<any> } = req.body;
//     const trimmedName = name.trim().toLowerCase();

//     // Check if a category with the same name already exists (case-insensitive)
//     const existingCategory = await SubCategoryModel.findOne({ name: trimmedName });
//     if (existingCategory) {
//         return sendErrorResponse(res, new ApiError(400, "Subcategory with the same name already exists."));
//     }

//     const newSubCategory = await SubCategoryModel.create({
//         categoryId,
//         name,
//         questionArray
//     });

//     if (!newSubCategory) {
//         return sendErrorResponse(res, new ApiError(500, "Something went wrong while adding the Category."));
//     }

//     // Helper function to recursively save derived questions
//     const saveQuestionWithDerived = async (questionData: any, parentId: ObjectId | null = null) => {
//         // Create the main or derived question
//         const question = await QuestionModel.create({
//             categoryId,
//             subCategoryId: newSubCategory._id,
//             question: questionData.question,
//             options: questionData.options,
//             optionSelected: questionData.optionSelected,
//             parentId: parentId // If it's a derived question, set the parentId
//         });

//         // If the current question has derived questions, recursively save them
//         if (questionData.derivedQuestions && questionData.derivedQuestions.length > 0) {
//             const derivedQuestionPromises = questionData.derivedQuestions.map((derivedQuestionData: any) => {
//                 // Recursively call the function for each derived question
//                 return saveQuestionWithDerived(derivedQuestionData, question._id);
//             });

//             // Wait for all derived questions to be saved
//             await Promise.all(derivedQuestionPromises);
//         }

//         // Return the saved question's ID (for possible use later)
//         return question._id;
//     };




//     // Loop over the main questions and save them, along with their derived questions
//     const savedQuestions = await Promise.all(
//         questionArray.map(async (questionData: any) => {
//             return await saveQuestionWithDerived(questionData);
//         })
//     );

//     // Optionally, store the array of question IDs in the subcategory (if you need it there)
//     newSubCategory.questionArray = savedQuestions;
//     await newSubCategory.save();

//     return sendSuccessResponse(res, 201, newSubCategory, "Subcategory and questions added successfully.");
// });

