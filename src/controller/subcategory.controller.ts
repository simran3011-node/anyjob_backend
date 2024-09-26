import { Response } from "express";
import { CustomRequest } from "../../types/commonType";
import SubCategoryModel from "../models/subcategory.model";
import QuestionModel from "../models/question.model";
import { ApiError } from "../utils/ApisErrors";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { ISubCategorySchema } from "../../types/schemaTypes";
import { AsyncHandler } from "../../types/commonType";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { ObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary";

// addSubCategory controller
export const addSubCategory = asyncHandler(async (req: CustomRequest, res: Response<ISubCategorySchema>) => {
    const { categoryId, name, subCategoryImage, questionArray }: { categoryId: ObjectId, name: String, subCategoryImage: String, questionArray: Array<any> } = req.body;
    // Trim and convert name to lowercase
    const trimmedName = name.trim().toLowerCase();
    console.log("trimmedName is===>", trimmedName);

    // Check if a category with the same name already exists (case-insensitive)
    const existingCategory = await SubCategoryModel.findOne({ name: trimmedName });
    if (existingCategory) {
        return sendErrorResponse(res, new ApiError(400, "Subcategory with the same name already exists."));
    }

    // const subCategoryImageFile = req.files as { [key: string]: Express.Multer.File[] };
    // if (!subCategoryImageFile) {
    //     return sendErrorResponse(res, new ApiError(400, "No files were uploaded"));
    // }
    // const subCatFile = subCategoryImageFile.subCategoryImage ? subCategoryImageFile.subCategoryImage[0] : undefined;
    // //upload cloudinary
    // const subCatImg = await uploadOnCloudinary(subCatFile?.path as string)
    const newSubCategory = await SubCategoryModel.create({
        categoryId,
        name,
        // subCategoryImage: subCatImg?.url,
        questionArray
    });

    if (!newSubCategory) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while adding the Category."));
    };

    // Step 2: Create and save questions to the Question collection, linking with the created subCategoryId
    const savedQuestions = questionArray.map(async (questionData: any) => {
        const mainQuestion = await QuestionModel.create({
            categoryId,
            subCategoryId: newSubCategory._id,
            question: questionData.question,
            options: questionData.options,
            optionSelected: questionData.optionSelected
        });
        if (questionData.derivedQuestions && questionData.derivedQuestions.length > 0) {
            // Create derived questions and set parentId as the mainQuestion._id
            const derivedQuestionPromises = questionData.derivedQuestions.map(async (derivedQuestionData: any) => {
                const derivedQuestion = await QuestionModel.create({
                    categoryId,
                    subCategoryId: newSubCategory._id,
                    question: derivedQuestionData.question,
                    options: derivedQuestionData.options,
                    optionSelected: derivedQuestionData.optionSelected,
                    parentId: mainQuestion._id // Set parentId to the main question's ObjectId
                });
            });

            // Wait for all derived questions to be saved
            const derivedQuestionIds = await Promise.all(derivedQuestionPromises);

            
        }
        return mainQuestion._id; // Return the question ObjectId
    })


    // Optionally, store the array of question IDs in the subcategory (if you need it there)
    newSubCategory.questionArray = savedQuestions;
    await newSubCategory.save();

    return sendSuccessResponse(res, 201, newSubCategory, "Subcategory and questions added successfully.");


    // return sendSuccessResponse(res, 201, newSubCategory, "Category added Successfully");
});

//fetch categorywise subcategory 
export const getSubCategories = asyncHandler(async (req: CustomRequest, res: Response<ISubCategorySchema>) => {
    const { categoryId } = req.params;
    const results = await SubCategoryModel.aggregate([
        {
            $match: { categoryId: new mongoose.Types.ObjectId(categoryId) }
        },
        { $sort: { createdAt: -1 } },
    ]);
    console.log(results);

    return sendSuccessResponse(res, 200, {
        results,

    }, "SubCategory retrieved successfully.");
});

// updateCategory controller
export const updateSubCategory = asyncHandler(async (req: CustomRequest, res: Response<ISubCategorySchema>) => {
    const { SubCategoryId } = req.params;
    const { name }: { name: string } = req.body;

    if (!SubCategoryId) {
        return sendErrorResponse(res, new ApiError(400, "SubCategory ID is required."));
    };

    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
        SubCategoryId,
        {
            $set: {
                name
            }
        }, { new: true }
    );

    if (!updatedSubCategory) {
        return sendErrorResponse(res, new ApiError(404, "Category not found for updating."));
    };

    return sendSuccessResponse(res, 200, updatedSubCategory, "Category updated Successfully");
});

// deleteCategory controller
export const deleteSubCategory = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { SubCategoryId } = req.params;
    if (!SubCategoryId) {
        return sendErrorResponse(res, new ApiError(400, "SubCategory ID is required."));
    };

    // Remove the SubCategory from the database
    const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(SubCategoryId);

    if (!deletedSubCategory) {
        return sendErrorResponse(res, new ApiError(404, "SubCategory not found for deleting."));
    };

    return sendSuccessResponse(res, 200, {}, "SubCategory deleted successfully");
});