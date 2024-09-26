import express, { Router } from "express";
import { VerifyJWTToken } from "../middlewares/auth/userAuth";
import QuestionModel from "../models/question.model";
import {
    fetchQuestionsSubCategorySubCategorywise,
    fetchDerivedQuestion
} from "../controller/question.controller";

const router:Router = express.Router();
// router.use(VerifyJWTToken); // Apply verifyJWT middleware to all routes in this file


router.route('/:categoryId/:subCategoryId').get(fetchQuestionsSubCategorySubCategorywise);
router.route('/:questionId').get(fetchDerivedQuestion);



export default router;