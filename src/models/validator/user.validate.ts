import Joi from 'joi';
import { IUser } from '../../../types/schemaTypes';

const validateUser = (userModel: IUser) => {
    const UserSchema = Joi.object({
        fullName: Joi.string().min(3).max(60).required().trim().messages({
            "string.empty": "Full name is required!",
            "string.min": "Minimum length should be 3",
            "string.max": "Maximum length should be 60"
        }),
        username: Joi.string().min(3).max(30).required().lowercase().trim().messages({
            "string.empty": "Username is required!",
            "string.min": "Username should be at least 3 characters long!",
            "string.max": "Username should be at most 30 characters long!"
        }),
        email: Joi.string().email().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).required().lowercase().trim().messages({
            "string.empty": "Email Address is required",
            "string.email": "Invalid email format",
            "string.pattern.base": "Email must be a valid format"
        }),
        watchHistory: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
        password: Joi.string().required().messages({
            "string.empty": "Password is required"
        }),
        coverImage: Joi.string().optional().allow("").default(""),
        refreshToken: Joi.string().optional().allow("").default(""),
        isDeleted: Joi.boolean().default(false),
    }).unknown(true);

    return UserSchema.validate(userModel, { abortEarly: false });
};

export default validateUser;