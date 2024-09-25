import { Response } from "express";
import { CustomRequest } from "../../types/commonType";
import ServiceModel from "../models/service.model";
import { ApiError } from "../utils/ApisErrors";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response";
import { IServiceSchema } from "../../types/schemaTypes";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { ObjectId } from "mongoose";

export const addService = asyncHandler(async (req: CustomRequest, res: Response<IServiceSchema>) => {
    const { categoryId, subCategoryId, serviceStartDate, serviceShifft, shiftTime, serviceZipCode, serviceLatitude, serviceLongitude, isIncentiveGiven, incentiveAmount,userId,answers }: { categoryId: ObjectId, subCategoryId: ObjectId, serviceStartDate: Date, serviceShifft: String, shiftTime: object, serviceZipCode: Number, serviceLatitude: Number, serviceLongitude: Number, isIncentiveGiven: Boolean, incentiveAmount: Number,userId:ObjectId,answers:Array<any> } = req.body;
    // console.log("req.body is===>", req.body);

    
    const newService = await ServiceModel.create({
        categoryId,
        subCategoryId,
        serviceStartDate,
        serviceShifft,
        shiftTime,
        serviceZipCode,
        serviceLatitude,
        serviceLongitude,
        isIncentiveGiven,
        incentiveAmount,
        answers,
        userId:req.user?._id
    });

    if (!newService) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while creating the Service Request."));
    };

    return sendSuccessResponse(res, 201, newService, "Service Request added Successfully");
});

export const getPendingServiceRequest = asyncHandler(async (req: CustomRequest, res: Response<IServiceSchema>) => {
    const results = await ServiceModel.aggregate([
        {
            $match: { isApproved: "Pending" }
        },
        {
            $lookup:{
                from:"categories",
                foreignField:"_id",
                localField:"categoryId",
                as:"categoryDetails"
            }
        },
        {
            $unwind:{
                preserveNullAndEmptyArrays:true,
                path:"$categoryDetails"
            }
        },
        {
            $lookup:{
                from:"subcategories",
                foreignField:"_id",
                localField:"subCategoryId",
                as:"subCategoryDetails"
            }
        },
        {
            $unwind:{
                preserveNullAndEmptyArrays:true,
                path:"$categoryDetails"
            }
        },
        {
            $unwind:{
                preserveNullAndEmptyArrays:true,
                path:"$subCategoryDetails"
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"userId",
                as:"userDetails"
            }
        },
        {
            $unwind:{
                preserveNullAndEmptyArrays:true,
                path:"$userDetails"
            }
        },
        {
            $addFields: {
                categoryName: "$categoryDetails.name",
                categoryImage: "$categoryDetails.categoryImage",
                subCategoryName: "$subCategoryDetails.name",
                subCategoryImage: "$subCategoryDetails.subCategoryImage",
                serviceCreatorName: "$userDetails.fullName"
            }
        },
        {
            $project:{
                categoryDetails:0,
                subCategoryDetails:0,
                userDetails:0,
                __v:0,
            }
        },
        { $sort: { createdAt: -1 } },
    ]);
    console.log(results);

    return sendSuccessResponse(res, 200, {
        results,

    }, "Service retrieved successfully.");
});


// updateService controller
export const updateService = asyncHandler(async (req: CustomRequest, res: Response<IServiceSchema>) => {
    const { serviceId } = req.params;
    const { categoryId, subCategoryId, serviceStartDate, serviceShifft, shiftTime, serviceZipCode, serviceLatitude, serviceLongitude, isIncentiveGiven, incentiveAmount }: { categoryId: ObjectId, subCategoryId: ObjectId, serviceStartDate: Date, serviceShifft: String, shiftTime: object, serviceZipCode: Number, serviceLatitude: Number, serviceLongitude: Number, isIncentiveGiven: Boolean, incentiveAmount: Number,userId:ObjectId } = req.body;
    console.log(req.params);
    

    if (!serviceId) {
        return sendErrorResponse(res, new ApiError(400, "Service ID is required."));
    };

    const updatedService = await ServiceModel.findByIdAndUpdate(
        {_id:new mongoose.Types.ObjectId(serviceId)},
        {
            $set: {
                categoryId,
                subCategoryId,
                serviceStartDate,
                serviceShifft,
                shiftTime,
                serviceZipCode,
                serviceLatitude,
                serviceLongitude,
                isIncentiveGiven,
                incentiveAmount,
            }
        }, { new: true }
    );

    if (!updatedService) {
        return sendErrorResponse(res, new ApiError(404, "Service not found for updating."));
    };

    return sendSuccessResponse(res, 200, updatedService, "Service Request updated Successfully");
});

export const deleteService = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { serviceId } = req.params;
    if (!serviceId) {
        return sendErrorResponse(res, new ApiError(400, "Service ID is required."));
    };

    // Remove the Category from the database
    const deletedService = await ServiceModel.findByIdAndDelete(serviceId);

    if (!deletedService) {
        return sendErrorResponse(res, new ApiError(404, "Service  not found for deleting."));
    };

    return sendSuccessResponse(res, 200, {}, "Service deleted successfully");
});
