import { Response } from "express";
import { CustomRequest } from "../../types/commonType";
import QuestionModel from "../models/question.model";
import { ApiError } from "../utils/ApisErrors";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { IQuestionSchema, IServiceSchema } from "../../types/schemaTypes";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { ObjectId } from "mongoose";

export const fetchQuestionsSubCategorySubCategorywise = asyncHandler(async (req:CustomRequest,res:Response)=>{
    const {categoryId,subCategoryId } = req.params;

    const results = await QuestionModel.aggregate([
        {
            $match:{
                categoryId:new mongoose.Types.ObjectId(categoryId),
                subCategoryId:new mongoose.Types.ObjectId(subCategoryId),
            }
        },       
    ])
    return sendSuccessResponse(res, 200, {
        results,

    }, "Questions retrieved successfully for the given Subcategory.");
});






