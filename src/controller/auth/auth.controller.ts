import { Request,Response } from "express";
import UserModel from "../../models/user.model";
import { ApiError } from "../../utils/ApisErrors";
import { ICredentials,ILoginCredentials,IRegisterCredentials } from "../../../types/requests_responseType";
import { sendSuccessResponse,sendErrorResponse } from "../../utils/response";
import { generateAccessAndRefreshToken } from "../../utils/createTokens";
import { CustomRequest } from "../../../types/commonType";
import { ApiResponse } from "../../utils/ApiResponse";
import { uploadOnCloudinary } from "../../utils/cloudinary";
import { asyncHandler } from "../../utils/asyncHandler";
import { IUser } from "../../../types/schemaTypes";
import jwt,{JwtPayload} from 'jsonwebtoken';


//register user controller
export const registerUser = asyncHandler( async(req:Request,res:Response)=>{
    const { fullName, username, email, password }: IRegisterCredentials = req.body;

    // Validate fields (Joi validation is preferred here)
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        return sendErrorResponse(res, new ApiError(400, "All fields are required"));
    }

    // Check for duplicate user
    const existingUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    });
    if (existingUser) {
        return sendErrorResponse(res, new ApiError(409, "User with email or username already exists"));
    };

    // Ensure `req.files` is defined and has the expected structure
    const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

    if (!files) {
        return sendErrorResponse(res, new ApiError(400, "No files were uploaded"));
    };

    const avatarFile = files.avatar ? files.avatar[0] : undefined;
    const coverImageFile = files.coverImage ? files.coverImage[0] : undefined;

    if (!avatarFile) {
        return sendErrorResponse(res, new ApiError(400, "Avatar file is required"));
    };

    // Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarFile.path);
    const coverImage = coverImageFile ? await uploadOnCloudinary(coverImageFile.path) : undefined;

    if (!avatar) {
        return sendErrorResponse(res, new ApiError(400, "Error uploading avatar file"));
    };

    // Create new user
    const newUser = await UserModel.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url
    });

    const createdUser = await UserModel.findById(newUser._id).select("-password -refreshToken");
    console.log(createdUser);
    
    if (!createdUser) {
        return sendErrorResponse(res, new ApiError(500, "Something went wrong while registering the user"));
    };

    return sendSuccessResponse(res, 201, createdUser , "User Registered Successfully");
});

//login user controller
export const loginUser = asyncHandler(async(req:Request,res:Response)=>{
    const {username,email,password}:IUser = req.body;

    if(!(username || email)){
        return sendErrorResponse(res, new ApiError(400, "Username or Email is required"));
    };

    const user = await UserModel.findOne(
        {
            $or:[
                {username},
                {email}
            ]
        }
    );
    if(!user){
        return sendErrorResponse(res, new ApiError(400, "User does not exist")); 
    };

    const isPasswordValid =  await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        return sendErrorResponse(res, new ApiError(403, "Invalid user credentials"));
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(res, user._id);
    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken");

    const cookieOption: { httpOnly: boolean, secure: boolean } = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOption)
        .cookie("refreshToken", refreshToken, cookieOption)
        .json
        (
            new ApiResponse
                (
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "User logged In successfully"
                )
        );
});

//logout user controller
export const logoutUser = asyncHandler(async (req: CustomRequest, res: Response) => {
    if (!req.user || !req.user?._id) {
        return sendErrorResponse(res, new ApiError(400, "User not found in request"));
    };

    const userId = req.user?._id;

    await UserModel.findByIdAndUpdate(
        userId,
        {
            $set: { refreshToken: "" }
        },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
    };

    return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// refreshAccessToken controller
export const refreshAccessToken = asyncHandler(async (req: CustomRequest, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return sendErrorResponse(res, new ApiError(401, "Unauthorized request"));
    };

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
        const user = await UserModel.findById(decodedToken?._id);

        if (!user) {
            return sendErrorResponse(res, new ApiError(401, "Invalid refresh token"));
        };

        if (user?.refreshToken !== incomingRefreshToken) {
            return sendErrorResponse(res, new ApiError(401, "Refresh token is expired or used"));
        };

        const cookieOption: { httpOnly: boolean, secure: boolean } = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(res, user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, cookieOption)
            .cookie("refreshToken", refreshToken, cookieOption)
            .json
            (
                new ApiResponse
                    (
                        200,
                        { accessToken, refreshToken },
                        "Access token refreshed"
                    )
            );
    } catch (exc: any) {
        return sendErrorResponse(res, new ApiError(401, exc.message || "Invalid refresh token"));
    };
});
