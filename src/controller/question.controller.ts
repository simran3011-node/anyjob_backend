import { Response } from "express";
import { CustomRequest } from "../../types/commonType";
import QuestionModel from "../models/question.model";
import { ApiError } from "../utils/ApisErrors";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { IQuestionSchema, IServiceSchema } from "../../types/schemaTypes";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { ObjectId } from "mongoose";

export const fetchQuestionsSubCategorywise = asyncHandler(async (req:CustomRequest,res:Response<IQuestionSchema>)=>{
    const {subCategoryId } = req.params;

    const results = await QuestionModel.find(
        {
            subCategoryId:subCategoryId
        }
    );
    return sendSuccessResponse(res, 200, {
        results,

    }, "Questions retrieved successfully for the given Subcategory.");
});
