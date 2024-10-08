
import express, { Router } from "express";
import ModelAuth from "../middlewares/auth/modelAuth";
import ValidateUser from "../models/validator/user.validate";
import {
    refreshAccessToken,
    logoutUser,
    loginUser,
    registerUser,
} from "../controller/auth/auth.controller";
import { upload } from "../middlewares/multer.middleware";
import validateUser from "../models/validator/user.validate";
import { VerifyJWTToken } from "../middlewares/auth/userAuth";

const router: Router = express.Router();

//sign-up
router.route('/signup').post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    [ModelAuth(ValidateUser)],
    registerUser,
    loginUser
);

//login or sign-in route
router.route('/signin').post(
    loginUser
);

/***************************** secured routes *****************************/
// Logout
router.route('/logout').post(
    [VerifyJWTToken],
    logoutUser
);

// Refresh token routes
router.route('/refresh-token').post(
    refreshAccessToken
);

export default router;